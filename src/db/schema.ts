import { boolean, foreignKey, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().notNull().unique(),
  discord_id: integer().notNull(),
  steam_id: integer().notNull(),
})

export const seasons = pgTable("seasons", {
  id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  season_name: varchar({ length: 64 }),
  is_active: boolean().default(false)
})

export const houses = pgTable("houses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  season_id: integer().references(() => seasons.id),
  house_name: varchar({ length: 64 }).notNull(),
  house_emoji: varchar({ length: 16 }).notNull()
})

export const user_houses = pgTable("user_houses", {
  user_id: integer().notNull().references(() => users.id),
  season_id: integer().notNull().references(() => seasons.id)
}, (table) => [primaryKey({ columns: [table.user_id, table.season_id] })])

export const point_actions = pgTable("point_actions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  target_id: integer().notNull().references(() => users.id),
  source_user_id: integer().references(() => users.id),
  reason: varchar({ length: 128 }),
  point_value: integer().notNull(),
  house_id: integer().references(() => houses.id)
})

export const log_channels = pgTable("log_channels", {
  guild_id: integer().notNull(),
  channel_id: integer().notNull(),
  season_id: integer().references(() => seasons.id)
}, (table) => [
  primaryKey({ columns: [table.guild_id, table.channel_id] })
])

export const logged_messages = pgTable("logged_messages", {
  action_id: integer().primaryKey().notNull().references(() => point_actions.id),
  channel_id: integer().notNull(),
  guild_id: integer().notNull(),
  message_id: integer().notNull().unique()
}, (table) => [
  foreignKey({
    columns: [table.guild_id, table.channel_id],
    foreignColumns: [log_channels.guild_id, log_channels.channel_id]
  })
])

export const summary_messages = pgTable("summary_messages", {
  channel_id: integer().notNull(),
  guild_id: integer().notNull(),
  message_id: integer().notNull().unique()
}, (table) => [
  primaryKey({ columns: [table.guild_id, table.channel_id] }),
  foreignKey({
    columns: [table.guild_id, table.channel_id],
    foreignColumns: [log_channels.guild_id, log_channels.channel_id]
  })
])
