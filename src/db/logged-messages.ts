import { InferSelectModel } from "drizzle-orm";
import { db } from "../lib/db.js";
import { logged_messages } from "./schema.js";

export type LoggedMessageModel = InferSelectModel<typeof logged_messages>;

export class LoggedMessages {
  static async create(actionId: number, channelId: bigint, guildId: bigint, messageId: bigint): Promise<LoggedMessageModel | undefined> {
    const log = await db.insert(logged_messages).values({
      action_id: actionId,
      channel_id: channelId,
      guild_id: guildId,
      message_id: messageId
    }).returning()
    return log.length === 1 ? log[0] : undefined
  }
}
