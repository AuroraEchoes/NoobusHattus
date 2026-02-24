import { and, eq, InferSelectModel } from "drizzle-orm";
import { summary_messages } from "./schema.js";
import { db } from "../lib/db.js";

export type SummaryMessageModel = InferSelectModel<typeof summary_messages>

export class SummaryMessages {
  static async getByGuildIdChannelId(guildId: bigint, channelId: bigint): Promise<SummaryMessageModel | undefined> {
    const [summaryMessage] = await db.select()
      .from(summary_messages)
      .where(and(eq(summary_messages.channel_id, channelId), eq(summary_messages.guild_id, guildId)))
    return summaryMessage
  }

  static async createOrUpdateMessageId(guildId: bigint, channelId: bigint, messageId: bigint): Promise<SummaryMessageModel | undefined> {
    const query = await db.select()
      .from(summary_messages)
      .where(and(eq(summary_messages.channel_id, channelId), eq(summary_messages.guild_id, guildId)))
    // Doesn’t already exist; should insert
    if (query.length === 0) {
      const inserted = await db.insert(summary_messages)
        .values({ guild_id: guildId, channel_id: channelId, message_id: messageId })
        .returning()
      return inserted.length === 1 ? inserted[0] : undefined
    } else {
      const updated = await db.update(summary_messages)
        .set({ message_id: messageId })
        .where(and(eq(summary_messages.channel_id, channelId), eq(summary_messages.guild_id, guildId)))
        .returning()
      return updated.length === 1 ? updated[0] : undefined
    }
  }
}
