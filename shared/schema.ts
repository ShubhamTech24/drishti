import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("volunteer"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Camera sources
export const sources = pgTable("sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceId: varchar("source_id").notNull().unique(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // camera, drone, sensor
  location: varchar("location").notNull(),
  lat: decimal("lat", { precision: 10, scale: 6 }),
  lng: decimal("lng", { precision: 10, scale: 6 }),
  protocol: varchar("protocol"), // rtsp, http, etc
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Frame snapshots
export const frames = pgTable("frames", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  frameId: varchar("frame_id").notNull().unique(),
  sourceId: varchar("source_id").notNull(),
  s3Url: text("s3_url").notNull(),
  tsUtc: timestamp("ts_utc").defaultNow(),
  width: integer("width"),
  height: integer("height"),
  fpsEstimate: decimal("fps_estimate", { precision: 5, scale: 2 }),
});

// AI Analysis results
export const analyses = pgTable("analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analysisId: varchar("analysis_id").notNull().unique(),
  frameId: varchar("frame_id").notNull(),
  crowdDensity: varchar("crowd_density").notNull(), // low, medium, high, critical
  estimatedPeople: integer("estimated_people"),
  riskLevel: varchar("risk_level").notNull(), // none, low, medium, high, critical
  detectedBehaviors: text("detected_behaviors").array(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  rawResponse: jsonb("raw_response"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pilgrim reports
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull().unique(),
  userId: varchar("user_id"), // nullable for anonymous reports
  type: varchar("type").notNull(), // panic, congestion, medical, lost_person, hazard
  lat: decimal("lat", { precision: 10, scale: 6 }),
  lng: decimal("lng", { precision: 10, scale: 6 }),
  text: text("text"),
  mediaUrl: text("media_url"),
  transcript: text("transcript"),
  status: varchar("status").default("new"), // new, triaged, assigned, resolved
  severity: varchar("severity"), // low, medium, high, critical
  createdAt: timestamp("created_at").defaultNow(),
});

// Events (incidents)
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().unique(),
  kind: varchar("kind").notNull(), // analysis, report, manual
  sourceFrameId: varchar("source_frame_id"),
  relatedReportId: varchar("related_report_id"),
  severity: varchar("severity").notNull(), // low, medium, high, critical
  zoneId: varchar("zone_id"),
  summary: text("summary"),
  assignedTo: varchar("assigned_to"),
  status: varchar("status").default("open"), // open, closed
  closedBy: varchar("closed_by"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Volunteers
export const volunteers = pgTable("volunteers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  phone: varchar("phone"),
  currentZone: varchar("current_zone"),
  status: varchar("status").default("available"), // available, assigned, on_break, offline
  lastSeen: timestamp("last_seen").defaultNow(),
  responseTimeAvg: decimal("response_time_avg", { precision: 5, scale: 2 }),
});

// Lost persons database
export const lostPersons = pgTable("lost_persons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull(),
  personDescription: text("person_description"),
  imageUrl: text("image_url"),
  embedding: text("embedding"), // face embedding as JSON string
  age: integer("age"),
  lastSeenLocation: varchar("last_seen_location"),
  contactInfo: varchar("contact_info"),
  status: varchar("status").default("missing"), // missing, found, closed
  createdAt: timestamp("created_at").defaultNow(),
});

export const mediaStorage = pgTable("media_storage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  mediaType: text("media_type").notNull(), // 'image' or 'video'
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  data: text("data").notNull(), // base64 encoded media
  analysisData: text("analysis_data"), // JSON string of AI analysis
  detectedPersons: text("detected_persons"), // JSON array of detected persons
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  source: text("source").default("upload"), // 'upload', 'camera_feed', etc.
});

// Insert schemas
export const insertSourceSchema = createInsertSchema(sources).omit({ id: true, createdAt: true });
export const insertFrameSchema = createInsertSchema(frames).omit({ id: true, tsUtc: true });
export const insertAnalysisSchema = createInsertSchema(analyses).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertVolunteerSchema = createInsertSchema(volunteers).omit({ id: true, lastSeen: true });
export const insertLostPersonSchema = createInsertSchema(lostPersons).omit({ id: true, createdAt: true });
export const insertMediaStorageSchema = createInsertSchema(mediaStorage).omit({ id: true, uploadedAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type Frame = typeof frames.$inferSelect;
export type Analysis = typeof analyses.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Volunteer = typeof volunteers.$inferSelect;
export type LostPerson = typeof lostPersons.$inferSelect;
export type MediaStorage = typeof mediaStorage.$inferSelect;
export type InsertMediaStorage = typeof insertMediaStorageSchema._type;

export type InsertSource = z.infer<typeof insertSourceSchema>;
export type InsertFrame = z.infer<typeof insertFrameSchema>;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type InsertLostPerson = z.infer<typeof insertLostPersonSchema>;
