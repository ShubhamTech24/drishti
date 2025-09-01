import {
  users,
  sources,
  frames,
  analyses,
  reports,
  events,
  volunteers,
  lostPersons,
  type User,
  type UpsertUser,
  type Source,
  type Frame,
  type Analysis,
  type Report,
  type Event,
  type Volunteer,
  type LostPerson,
  type InsertSource,
  type InsertFrame,
  type InsertAnalysis,
  type InsertReport,
  type InsertEvent,
  type InsertVolunteer,
  type InsertLostPerson,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Source operations
  createSource(source: InsertSource): Promise<Source>;
  getSources(): Promise<Source[]>;
  getSourceBySourceId(sourceId: string): Promise<Source | undefined>;
  
  // Frame operations
  createFrame(frame: InsertFrame): Promise<Frame>;
  getFrameById(frameId: string): Promise<Frame | undefined>;
  
  // Analysis operations
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysesByRiskLevel(riskLevel: string): Promise<Analysis[]>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReports(limit?: number): Promise<Report[]>;
  updateReportStatus(reportId: string, status: string): Promise<void>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(limit?: number): Promise<Event[]>;
  updateEventStatus(eventId: string, status: string, closedBy?: string): Promise<void>;
  assignEvent(eventId: string, assignedTo: string): Promise<void>;
  
  // Volunteer operations
  createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>;
  getVolunteers(): Promise<Volunteer[]>;
  updateVolunteerStatus(volunteerId: string, status: string): Promise<void>;
  
  // Lost person operations
  createLostPerson(lostPerson: InsertLostPerson): Promise<LostPerson>;
  searchLostPersons(embedding: string): Promise<LostPerson[]>;
  
  // Analytics
  getCrowdStats(): Promise<{
    totalAttendees: number;
    safeZonePercentage: number;
    highDensityPercentage: number;
    avgResponseTime: number;
    activeVolunteers: number;
    reportsToday: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Source operations
  async createSource(source: InsertSource): Promise<Source> {
    const [newSource] = await db.insert(sources).values(source).returning();
    return newSource;
  }

  async getSources(): Promise<Source[]> {
    return await db.select().from(sources).where(eq(sources.status, "active"));
  }

  async getSourceBySourceId(sourceId: string): Promise<Source | undefined> {
    const [source] = await db.select().from(sources).where(eq(sources.sourceId, sourceId));
    return source;
  }

  // Frame operations
  async createFrame(frame: InsertFrame): Promise<Frame> {
    const [newFrame] = await db.insert(frames).values(frame).returning();
    return newFrame;
  }

  async getFrameById(frameId: string): Promise<Frame | undefined> {
    const [frame] = await db.select().from(frames).where(eq(frames.frameId, frameId));
    return frame;
  }

  // Analysis operations
  async createAnalysis(analysis: InsertAnalysis): Promise<Analysis> {
    const [newAnalysis] = await db.insert(analyses).values(analysis).returning();
    return newAnalysis;
  }

  async getAnalysesByRiskLevel(riskLevel: string): Promise<Analysis[]> {
    return await db.select().from(analyses)
      .where(eq(analyses.riskLevel, riskLevel))
      .orderBy(desc(analyses.createdAt))
      .limit(10);
  }

  // Report operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async getReports(limit = 50): Promise<Report[]> {
    return await db.select().from(reports)
      .orderBy(desc(reports.createdAt))
      .limit(limit);
  }

  async updateReportStatus(reportId: string, status: string): Promise<void> {
    await db.update(reports)
      .set({ status })
      .where(eq(reports.reportId, reportId));
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEvents(limit = 50): Promise<Event[]> {
    return await db.select().from(events)
      .orderBy(desc(events.createdAt))
      .limit(limit);
  }

  async updateEventStatus(eventId: string, status: string, closedBy?: string): Promise<void> {
    const updateData: any = { status };
    if (status === "closed") {
      updateData.closedAt = new Date();
      updateData.closedBy = closedBy;
    }
    
    await db.update(events)
      .set(updateData)
      .where(eq(events.eventId, eventId));
  }

  async assignEvent(eventId: string, assignedTo: string): Promise<void> {
    await db.update(events)
      .set({ assignedTo })
      .where(eq(events.eventId, eventId));
  }

  // Volunteer operations
  async createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer> {
    const [newVolunteer] = await db.insert(volunteers).values(volunteer).returning();
    return newVolunteer;
  }

  async getVolunteers(): Promise<Volunteer[]> {
    return await db.select().from(volunteers)
      .orderBy(volunteers.name);
  }

  async updateVolunteerStatus(volunteerId: string, status: string): Promise<void> {
    await db.update(volunteers)
      .set({ status, lastSeen: new Date() })
      .where(eq(volunteers.id, volunteerId));
  }

  // Lost person operations
  async createLostPerson(lostPerson: InsertLostPerson): Promise<LostPerson> {
    const [newLostPerson] = await db.insert(lostPersons).values(lostPerson).returning();
    return newLostPerson;
  }

  async searchLostPersons(embedding: string): Promise<LostPerson[]> {
    // This would use vector similarity search in production
    // For now, return recent missing persons
    return await db.select().from(lostPersons)
      .where(eq(lostPersons.status, "missing"))
      .orderBy(desc(lostPersons.createdAt))
      .limit(10);
  }

  // Analytics
  async getCrowdStats(): Promise<{
    totalAttendees: number;
    safeZonePercentage: number;
    highDensityPercentage: number;
    avgResponseTime: number;
    activeVolunteers: number;
    reportsToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get recent analyses for crowd stats
    const recentAnalyses = await db.select().from(analyses)
      .where(gte(analyses.createdAt, today))
      .orderBy(desc(analyses.createdAt))
      .limit(100);

    const totalAttendees = recentAnalyses.reduce((sum, analysis) => 
      sum + (analysis.estimatedPeople || 0), 0);

    const safeZones = recentAnalyses.filter(a => 
      a.crowdDensity === 'low' || a.crowdDensity === 'medium').length;
    const safeZonePercentage = recentAnalyses.length > 0 ? 
      Math.round((safeZones / recentAnalyses.length) * 100) : 0;

    const highDensityZones = recentAnalyses.filter(a => 
      a.crowdDensity === 'high' || a.crowdDensity === 'critical').length;
    const highDensityPercentage = recentAnalyses.length > 0 ? 
      Math.round((highDensityZones / recentAnalyses.length) * 100) : 0;

    // Get volunteer stats
    const activeVolunteersCount = await db.select({ count: sql<number>`count(*)` })
      .from(volunteers)
      .where(eq(volunteers.status, "available"));

    // Get reports today
    const reportsToday = await db.select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(gte(reports.createdAt, today));

    return {
      totalAttendees,
      safeZonePercentage,
      highDensityPercentage,
      avgResponseTime: 1.8, // This would be calculated from actual response times
      activeVolunteers: activeVolunteersCount[0]?.count || 0,
      reportsToday: reportsToday[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
