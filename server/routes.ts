import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { analyzeImageFrame, generateAlertText, transcribeAudio } from "./services/openai";
import multer from "multer";
import { randomUUID } from "crypto";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // WebSocket clients storage
  const wsClients = new Set<WebSocket>();

  // Broadcast to all connected clients
  function broadcast(event: string, data: any) {
    const message = JSON.stringify({ event, data });
    wsClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Frame upload endpoint
  app.post('/api/frames/upload', upload.single('file'), async (req, res) => {
    try {
      const { source_id } = req.body;
      const file = req.file;

      if (!file || !source_id) {
        return res.status(400).json({ message: "Missing file or source_id" });
      }

      // In production, upload to S3/MinIO
      const frameId = randomUUID();
      const s3Url = `https://mock-bucket.s3.amazonaws.com/${source_id}/${file.originalname}`;

      // Create frame record
      const frame = await storage.createFrame({
        frameId,
        sourceId: source_id,
        s3Url,
        width: 1920,
        height: 1080,
        fpsEstimate: "1.0"
      });

      // Analyze frame with OpenAI
      const analysis = await analyzeImageFrame(s3Url, frameId);
      
      // Create analysis record
      const analysisRecord = await storage.createAnalysis({
        analysisId: randomUUID(),
        frameId,
        crowdDensity: analysis.crowd_density,
        estimatedPeople: analysis.estimated_people,
        riskLevel: analysis.risk_level,
        detectedBehaviors: analysis.detected_behaviors,
        confidence: analysis.confidence.toString(),
        rawResponse: analysis
      });

      // Create event if risk level is medium or higher
      if (['medium', 'high', 'critical'].includes(analysis.risk_level)) {
        const eventSummary = `${analysis.crowd_density} density detected with ${analysis.estimated_people} people. Risk: ${analysis.risk_level}`;
        
        const event = await storage.createEvent({
          eventId: randomUUID(),
          kind: "analysis",
          sourceFrameId: frameId,
          severity: analysis.risk_level,
          zoneId: source_id,
          summary: eventSummary
        });

        // Broadcast to connected clients
        broadcast("incident", {
          event,
          analysis: analysisRecord,
          frame
        });
      }

      res.json({ frame_id: frameId, analysis: analysisRecord });
    } catch (error) {
      console.error("Frame upload error:", error);
      res.status(500).json({ message: "Failed to process frame" });
    }
  });

  // Report submission endpoint
  app.post('/api/reports/submit', upload.single('media'), async (req, res) => {
    try {
      const { type, lat, lng, text, user_id } = req.body;
      const file = req.file;

      let mediaUrl = null;
      let transcript = null;

      if (file) {
        // Upload to S3/MinIO in production
        mediaUrl = `https://mock-bucket.s3.amazonaws.com/reports/${randomUUID()}-${file.originalname}`;

        // If audio file, transcribe it
        if (file.mimetype.startsWith('audio/')) {
          transcript = await transcribeAudio(mediaUrl);
        }
      }

      const reportId = randomUUID();
      const report = await storage.createReport({
        reportId,
        userId: user_id,
        type,
        lat,
        lng,
        text: text || transcript,
        mediaUrl,
        transcript,
        severity: type === 'panic' ? 'critical' : 'medium'
      });

      // Create event for high priority reports
      if (type === 'panic' || type === 'medical') {
        const event = await storage.createEvent({
          eventId: randomUUID(),
          kind: "report",
          relatedReportId: reportId,
          severity: type === 'panic' ? 'critical' : 'high',
          zoneId: `zone-${lat}-${lng}`,
          summary: `${type} report: ${text || transcript || 'Media uploaded'}`
        });

        broadcast("incident", { event, report });
      }

      res.json({ report_id: reportId, report });
    } catch (error) {
      console.error("Report submission error:", error);
      res.status(500).json({ message: "Failed to submit report" });
    }
  });

  // Get events
  app.get('/api/events', isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getEvents(50);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Acknowledge event
  app.post('/api/events/:eventId/acknowledge', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.claims.sub;
      
      await storage.updateEventStatus(eventId, "acknowledged");
      
      broadcast("event_update", { eventId, status: "acknowledged", userId });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error acknowledging event:", error);
      res.status(500).json({ message: "Failed to acknowledge event" });
    }
  });

  // Assign event to volunteer
  app.post('/api/events/:eventId/assign', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const { volunteerId } = req.body;
      
      await storage.assignEvent(eventId, volunteerId);
      await storage.updateVolunteerStatus(volunteerId, "assigned");
      
      broadcast("event_assignment", { eventId, volunteerId });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error assigning event:", error);
      res.status(500).json({ message: "Failed to assign event" });
    }
  });

  // Generate alert
  app.post('/api/alerts/generate', isAuthenticated, async (req, res) => {
    try {
      const { zone, languages, alertType } = req.body;
      
      const alertText = await generateAlertText(zone, alertType);
      
      // In production, this would trigger TTS and broadcast to speakers
      broadcast("alert_generated", { zone, alertText, languages });
      
      res.json({ alertText });
    } catch (error) {
      console.error("Error generating alert:", error);
      res.status(500).json({ message: "Failed to generate alert" });
    }
  });

  // Get volunteers
  app.get('/api/volunteers', isAuthenticated, async (req, res) => {
    try {
      const volunteers = await storage.getVolunteers();
      res.json(volunteers);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      res.status(500).json({ message: "Failed to fetch volunteers" });
    }
  });

  // Get crowd statistics
  app.get('/api/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getCrowdStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get sources (cameras)
  app.get('/api/sources', isAuthenticated, async (req, res) => {
    try {
      const sources = await storage.getSources();
      res.json(sources);
    } catch (error) {
      console.error("Error fetching sources:", error);
      res.status(500).json({ message: "Failed to fetch sources" });
    }
  });

  // Lost person search
  app.post('/api/lost-persons/search', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "Missing image file" });
      }

      // In production, generate embedding from image
      const mockEmbedding = "mock_embedding_vector";
      
      const matches = await storage.searchLostPersons(mockEmbedding);
      
      res.json({ matches });
    } catch (error) {
      console.error("Error searching lost persons:", error);
      res.status(500).json({ message: "Failed to search lost persons" });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    wsClients.add(ws);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      wsClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });

    // Send initial data
    ws.send(JSON.stringify({
      event: 'connected',
      data: { message: 'Connected to Drishti Command Center' }
    }));
  });

  return httpServer;
}
