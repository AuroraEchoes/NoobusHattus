import { and, eq, InferSelectModel } from "drizzle-orm";
import { db } from "../lib/db.js";
import { log_channels, logged_messages, summary_messages } from "./schema.js";

export type LogChannelModel = InferSelectModel<typeof log_channels>;

export class LogChannels {
  static async getByGuild(guildId: bigint): Promise<LogChannelModel | undefined> {
    const [logChannel] = await db.select().from(log_channels).where(eq(log_channels.guild_id, guildId))
    return logChannel
  }

  static async create(channelId: bigint, guildId: bigint): Promise<LogChannelModel | undefined> {
    try {
      const newChannel = await db.insert(log_channels)
        .values({ channel_id: channelId, guild_id: guildId })
        .returning()

      return newChannel[0];
    }
    catch (e) { return undefined; }
  }

  static async delete(channelId: bigint, guildId: bigint): Promise<LogChannelModel | undefined> {
    await db.delete(logged_messages)
      .where(and(eq(logged_messages.channel_id, channelId), eq(logged_messages.guild_id, guildId)));
    await db.delete(summary_messages)
      .where(and(eq(summary_messages.channel_id, channelId), eq(summary_messages.guild_id, guildId)));

    const delChannel = await db.delete(log_channels)
      .where(and(eq(log_channels.channel_id, channelId), eq(log_channels.guild_id, guildId)))
      .returning()
    return delChannel.length === 1 ? delChannel[0] : undefined
  }
}
