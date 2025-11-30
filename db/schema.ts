import { pgTable, text, timestamp, integer, varchar } from "drizzle-orm/pg-core"

export const songs = pgTable("songs", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull(),
  source: varchar("source", { length: 50 }).notNull(),
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  addedBy: text("added_by").notNull(),
  addedByFingerprint: text("added_by_fingerprint").notNull(),
  duration: integer("duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const userFingerprints = pgTable("user_fingerprints", {
  fingerprint: text("fingerprint").primaryKey(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSongAddedAt: timestamp("last_song_added_at"),
})

export const appState = pgTable("app_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Song = typeof songs.$inferSelect
export type NewSong = typeof songs.$inferInsert
export type UserFingerprint = typeof userFingerprints.$inferSelect
export type NewUserFingerprint = typeof userFingerprints.$inferInsert
export type AppState = typeof appState.$inferSelect
export type NewAppState = typeof appState.$inferInsert

