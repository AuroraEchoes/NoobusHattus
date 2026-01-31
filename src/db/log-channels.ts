import { and, eq, InferSelectModel } from "drizzle-orm";
import { db } from "../lib/db.js";
import { log_channels } from "./schema.js";

export type LogChannelModel = InferSelectModel<typeof log_channels>;

export class LogChannel {
  static async getBySeason(seasonId: number): Promise<LogChannelModel[]> {
    const logChannels = await db.select().from(log_channels).where(eq(log_channels.season_id, BigInt(seasonId)));
    return logChannels;
  }

  static async create(seasonId: number, channelId: bigint, guildId: bigint): Promise<LogChannelModel | undefined> {
    const newChannel = await db.insert(log_channels)
      .values({ channel_id: channelId, guild_id: guildId, season_id: BigInt(seasonId) })
      .returning()
    return newChannel[0];
  }

  static async delete(channelId: bigint, guildId: bigint): Promise<void> {
    await db.delete(log_channels)
      .where(and(eq(log_channels.channel_id, channelId), eq(log_channels.guild_id, guildId)))
  }
}
