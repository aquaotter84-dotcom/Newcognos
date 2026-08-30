import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ──────────────────────────────────────────────────────────────────

export const memoryTierEnum = pgEnum("memory_tier", [
  "short",
  "medium",
  "long",
  "mythic",
]);

export const operatorEnum = pgEnum("operator", [
  "observer",
  "strategist",
  "critic",
  "governor",
  "orchestrator",
]);

// ─── Sessions ────────────────────────────────────────────────────────────────

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().default("New Session"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Messages ────────────────────────────────────────────────────────────────

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  councilTrace: jsonb("council_trace"), // operator outputs
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Memory ──────────────────────────────────────────────────────────────────

export const memories = pgTable("memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => sessions.id, {
    onDelete: "set null",
  }),
  tier: memoryTierEnum("tier").notNull().default("medium"),
  operator: operatorEnum("operator").notNull().default("orchestrator"),
  key: text("key").notNull(),
  value: text("value").notNull(),
  relevanceScore: integer("relevance_score").notNull().default(50),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});
