import { bigint, boolean, foreignKey, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: bigint({ mode: 'bigint' }).primaryKey().notNull().unique(),
  discord_id: bigint({ mode: 'bigint' }).notNull(),
  steam_id: bigint({ mode: 'bigint' }).notNull(),
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
  user_id: bigint({ mode: 'bigint' }).notNull().references(() => users.id),
  season_id: integer().notNull().references(() => seasons.id),
  house_id: integer().notNull().references(() => houses.id)
}, (table) => [primaryKey({ columns: [table.user_id, table.season_id] })])

export const point_actions = pgTable("point_actions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  target_id: integer().notNull().references(() => users.id),
  source_user_id: bigint({ mode: 'bigint' }).references(() => users.id),
  reason: varchar({ length: 128 }),
  point_value: integer().notNull(),
  house_id: integer().references(() => houses.id)
})

export const log_channels = pgTable("log_channels", {
  guild_id: bigint({ mode: 'bigint' }).notNull(),
  channel_id: bigint({ mode: 'bigint' }).notNull(),
  season_id: bigint({ mode: 'bigint' }).references(() => seasons.id)
}, (table) => [
  primaryKey({ columns: [table.guild_id, table.channel_id] })
])

export const logged_messages = pgTable("logged_messages", {
  action_id: integer().primaryKey().notNull().references(() => point_actions.id),
  channel_id: bigint({ mode: 'bigint' }).notNull(),
  guild_id: bigint({ mode: 'bigint' }).notNull(),
  message_id: bigint({ mode: 'bigint' }).notNull().unique()
}, (table) => [
  foreignKey({
    columns: [table.guild_id, table.channel_id],
    foreignColumns: [log_channels.guild_id, log_channels.channel_id]
  })
])

export const summary_messages = pgTable("summary_messages", {
  channel_id: bigint({ mode: 'bigint' }).notNull(),
  guild_id: bigint({ mode: 'bigint' }).notNull(),
  message_id: bigint({ mode: 'bigint' }).notNull().unique(),
}, (table) => [
  primaryKey({ columns: [table.guild_id, table.channel_id] }),
  foreignKey({
    columns: [table.guild_id, table.channel_id],
    foreignColumns: [log_channels.guild_id, log_channels.channel_id]
  })
])

export const permission_roles = pgTable("permission_roles", {
  permission: varchar({ length: 32 }),
  role_id: bigint({ mode: 'bigint' })
}, (table) => [
  primaryKey({ columns: [table.permission, table.role_id] })
])
