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

// User storage table for custom authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  email: varchar("email").unique(),
  password: varchar("password").notNull(), // hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("volunteer"), // volunteer or admin
  isActive: boolean("is_active").default(true),
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

// Notifications for disasters, panic alerts, etc.
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // disaster, panic, emergency, info
  severity: varchar("severity").notNull(), // low, medium, high, critical
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Help requests from users
export const helpRequests = pgTable("help_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // Link to authenticated user
  userName: varchar("user_name").notNull(),
  userContact: varchar("user_contact").notNull(),
  location: varchar("location").notNull(),
  description: text("description").notNull(),
  requestType: varchar("request_type").notNull(), // medical, security, lost_person, general
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  status: varchar("status").default("pending"), // pending, assigned, resolved, closed
  assignedTo: varchar("assigned_to"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Messages between users and admins
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id"), // null for broadcast messages
  subject: varchar("subject"),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("direct"), // direct, broadcast, system
  isRead: boolean("is_read").default(false),
  relatedHelpRequestId: varchar("related_help_request_id"), // Link to help request
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Message attachments
export const messageAttachments = pgTable("message_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull(),
  fileName: varchar("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type"), // image, video, audio, document
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertSourceSchema = createInsertSchema(sources).omit({ id: true, createdAt: true });
export const insertFrameSchema = createInsertSchema(frames).omit({ id: true, tsUtc: true });
export const insertAnalysisSchema = createInsertSchema(analyses).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertVolunteerSchema = createInsertSchema(volunteers).omit({ id: true, lastSeen: true });
export const insertLostPersonSchema = createInsertSchema(lostPersons).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertHelpRequestSchema = createInsertSchema(helpRequests).omit({ id: true, createdAt: true, resolvedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, readAt: true });
export const insertMessageAttachmentSchema = createInsertSchema(messageAttachments).omit({ id: true, createdAt: true });

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
export type Notification = typeof notifications.$inferSelect;
export type HelpRequest = typeof helpRequests.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageAttachment = typeof messageAttachments.$inferSelect;

export type InsertSource = z.infer<typeof insertSourceSchema>;
export type InsertFrame = z.infer<typeof insertFrameSchema>;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type InsertLostPerson = z.infer<typeof insertLostPersonSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertHelpRequest = z.infer<typeof insertHelpRequestSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertMessageAttachment = z.infer<typeof insertMessageAttachmentSchema>;
