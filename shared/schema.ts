import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  classOf: varchar("class_of", { length: 4 }).notNull(),
  clan: varchar("clan", { length: 20 }).notNull(),
  profilePicture: text("profile_picture"),
  coverPhoto: text("cover_photo"),
  bio: text("bio"),
  favoriteTeacher: text("favorite_teacher"),
  hobby: text("hobby"),
  isVerified: boolean("is_verified").default(false),
  verificationCode: varchar("verification_code", { length: 6 }),
  resetCode: varchar("reset_code", { length: 6 }),
  resetCodeExpires: timestamp("reset_code_expires"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type", { length: 20 }),
  fileName: text("file_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reactions = pgTable("reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  postId: varchar("post_id").references(() => posts.id).notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'like', 'love', 'laugh', 'sad'
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  postId: varchar("post_id").references(() => posts.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type", { length: 20 }),
  fileName: text("file_name"),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Feedbacks table definition
export const feedbacks = pgTable("feedback", {
  id: text("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  type: text("type").notNull(), // 'public', 'private', 'anonymous'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Gallery table for dedicated photo/video uploads
export const gallery = pgTable("gallery", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title"),
  description: text("description"),
  mediaUrl: text("media_url").notNull(),
  mediaType: varchar("media_type", { length: 20 }).notNull(), // 'image', 'video'
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gallery reactions table
export const galleryReactions = pgTable("gallery_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  galleryId: varchar("gallery_id").references(() => gallery.id).notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'like', 'love', 'dislike'
  createdAt: timestamp("created_at").defaultNow(),
});


// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  reactions: many(reactions),
  comments: many(comments),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  galleryItems: many(gallery),
  galleryReactions: many(galleryReactions),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  reactions: many(reactions),
  comments: many(comments),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [reactions.postId],
    references: [posts.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const galleryRelations = relations(gallery, ({ one, many }) => ({
  user: one(users, {
    fields: [gallery.userId],
    references: [users.id],
  }),
  reactions: many(galleryReactions),
}));

export const galleryReactionsRelations = relations(galleryReactions, ({ one }) => ({
  user: one(users, {
    fields: [galleryReactions.userId],
    references: [users.id],
  }),
  galleryItem: one(gallery, {
    fields: [galleryReactions.galleryId],
    references: [gallery.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isVerified: true,
  verificationCode: true,
  resetCode: true,
  resetCodeExpires: true,
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export const resetPasswordSchema = z.object({
  code: z.string().length(6, "Code must be 6 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const verificationSchema = z.object({
  code: z.string().length(6, "Code must be 6 characters"),
});

export const profileSetupSchema = z.object({
  bio: z.string().optional(),
  favoriteTeacher: z.string().optional(),
  hobby: z.string().optional(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertCommentSchema = z.object({
  postId: z.string(),
  content: z.string().min(1).max(500),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;

export const insertMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().optional(),
  mediaUrl: z.string().optional(),
  mediaType: z.string().optional(),
  fileName: z.string().optional(),
}).refine((data) => data.content || data.mediaUrl, {
  message: "Either content or media is required",
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const insertFeedbackSchema = z.object({
  content: z.string().min(1).max(1000),
  rating: z.number().min(1).max(10),
  type: z.enum(['public', 'private', 'anonymous']),
});

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

// Gallery schemas
export const insertGallerySchema = createInsertSchema(gallery).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGalleryReactionSchema = createInsertSchema(galleryReactions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type InsertGalleryReaction = z.infer<typeof insertGalleryReactionSchema>;

// User type based on the users table
export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  classOf: string;
  clan: string;
  profilePicture: string | null;
  coverPhoto: string | null;
  bio: string | null;
  favoriteTeacher: string | null;
  hobby: string | null;
  isVerified: boolean;
  verificationCode: string | null;
  resetCode: string | null;
  resetCodeExpires: Date | null;
  createdAt: Date;
  graduationYear?: number; // For compatibility
};

export interface Feedback {
  id: string;
  userId: string;
  content: string;
  rating: number;
  type: 'public' | 'private' | 'anonymous';
  isAnonymous: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
}

// Type definitions for better organization
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type VerificationData = z.infer<typeof verificationSchema>;
export type ProfileSetupData = z.infer<typeof profileSetupSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertReaction = z.infer<typeof insertReactionSchema>;

// Additional inferred types from tables
export type Post = typeof posts.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Gallery = typeof gallery.$inferSelect;
export type GalleryReaction = typeof galleryReactions.$inferSelect;