import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface DemoVideo {
  id: string;
  name: string;
  type: 'crowd' | 'lost_person' | 'emergency';
  status: 'uploaded' | 'processing' | 'ready';
  size: string;
  duration: string;
  simulatedCameraId: string;
}

export default function PrototypeDemoPanel() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [demoVideos, setDemoVideos] = useState<DemoVideo[]>([]);
  const [simulatedFeeds, setSimulatedFeeds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate video file
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid File",
        description: "Please upload a video file for demonstration",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('video', file);
      formData.append('demo_type', 'crowd_analysis');

      // Real API call to prototype endpoint
      const response = await fetch('/api/prototype/video', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      const newVideo: DemoVideo = {
        id: `demo_${Date.now()}`,
        name: file.name,
        type: 'crowd',
        status: 'ready',
        size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
        duration: '2:30', // Simulated duration
        simulatedCameraId: `CAM-DEMO-${demoVideos.length + 1}`
      };

      setDemoVideos(prev => [...prev, newVideo]);
      setUploadProgress(100);

      toast({
        title: "Video Uploaded Successfully",
        description: `${file.name} is ready for demonstration`,
      });

    } catch (error) {
      toast({
        title: "Upload Failed", 
        description: "Failed to upload demonstration video",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const startSimulatedFeed = (video: DemoVideo) => {
    if (!simulatedFeeds.includes(video.simulatedCameraId)) {
      setSimulatedFeeds(prev => [...prev, video.simulatedCameraId]);
      
      toast({
        title: "Live Feed Simulation Started",
        description: `${video.simulatedCameraId} is now broadcasting for demo`,
      });

      // Simulate periodic AI analysis
      setTimeout(() => {
        toast({
          title: "AI Analysis Result",
          description: `Crowd density: HIGH detected in ${video.simulatedCameraId}`,
        });
      }, 5000);
    }
  };

  const stopSimulatedFeed = (cameraId: string) => {
    setSimulatedFeeds(prev => prev.filter(id => id !== cameraId));
    toast({
      title: "Feed Stopped",
      description: `${cameraId} simulation ended`,
    });
  };

  const runDemoAnalysis = async (video: DemoVideo) => {
    toast({
      title: "Running AI Analysis",
      description: "Processing video frames for crowd density analysis...",
    });

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockResults = {
      crowd: {
        density: 'critical',
        people_count: 247,
        risk_level: 'high',
        incidents: ['Bottleneck detected at main entrance', 'High density area requires immediate attention']
      },
      lost_person: {
        faces_detected: 15,
        matches_found: 1,
        confidence: 0.89,
        match_details: 'Possible match for राधा देवी in sector A-2'
      },
      emergency: {
        audio_alerts: ['Medical assistance needed', 'Help required near gate 3'],
        priority: 'urgent'
      }
    };

    const results = mockResults[video.type] || mockResults.crowd;

    toast({
      title: "Analysis Complete",
      description: JSON.stringify(results, null, 2),
    });
  };

  return (
    <Card className="spiritual-border shadow-lg sacred-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3 font-vintage text-shadow-golden">
          <i className="fas fa-presentation text-primary divine-glow"></i>
          <span>Prototype Demonstration Panel • प्रोटोटाइप प्रदर्शन</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Video Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-card-foreground">Upload Demo Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="video-upload">Select Demonstration Video</Label>
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                ref={fileInputRef}
                onChange={handleVideoUpload}
                disabled={isUploading}
                data-testid="input-demo-video"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full"
                data-testid="button-upload-demo"
              >
                <i className="fas fa-upload mr-2"></i>
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading demonstration video...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>

        {/* Demo Videos List */}
        {demoVideos.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Demo Videos Ready</h3>
            <div className="grid gap-4">
              {demoVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="p-4 border rounded-lg bg-muted/50"
                  data-testid={`demo-video-${video.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{video.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{video.size}</span>
                        <span>{video.duration}</span>
                        <Badge variant="outline">{video.simulatedCameraId}</Badge>
                      </div>
                    </div>
                    <Badge 
                      variant={video.status === 'ready' ? 'default' : 'secondary'}
                    >
                      {video.status}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => startSimulatedFeed(video)}
                      disabled={simulatedFeeds.includes(video.simulatedCameraId)}
                      data-testid={`button-start-feed-${video.id}`}
                    >
                      <i className="fas fa-play mr-1"></i>
                      {simulatedFeeds.includes(video.simulatedCameraId) ? 'Broadcasting' : 'Start Live Feed'}
                    </Button>
                    
                    {simulatedFeeds.includes(video.simulatedCameraId) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => stopSimulatedFeed(video.simulatedCameraId)}
                        data-testid={`button-stop-feed-${video.id}`}
                      >
                        <i className="fas fa-stop mr-1"></i>
                        Stop Feed
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => runDemoAnalysis(video)}
                      data-testid={`button-analyze-${video.id}`}
                    >
                      <i className="fas fa-brain mr-1"></i>
                      Run AI Analysis
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Simulation Status */}
        {simulatedFeeds.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Active Simulated Feeds</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {simulatedFeeds.map((feedId) => (
                <div 
                  key={feedId}
                  className="flex items-center space-x-2 p-2 bg-green-100 dark:bg-green-900 rounded"
                  data-testid={`active-feed-${feedId}`}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{feedId}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demo Instructions */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center">
            <i className="fas fa-info-circle mr-2 text-blue-500"></i>
            Demonstration Instructions
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Upload videos showing crowd scenarios, lost persons, or emergency situations</li>
            <li>• Start simulated live feeds to demonstrate real-time monitoring</li>
            <li>• Run AI analysis to show crowd counting and face recognition capabilities</li>
            <li>• All features work without actual camera hardware for prototype demo</li>
            <li>• Perfect for judge demonstrations and prototype presentations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}