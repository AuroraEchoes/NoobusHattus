import { eq, InferSelectModel } from "drizzle-orm";
import { processed_logs } from "./schema.js";
import { db } from "../lib/db.js";

export type ProcessedLogsModel = InferSelectModel<typeof processed_logs>;

export class ProcessedLogs {
  static async contains(logId: bigint): Promise<boolean> {
    const logs = await db.select().from(processed_logs).where(eq(processed_logs.log_id, logId))
    return logs.length !== 0
  }

  static async add(logId: bigint): Promise<ProcessedLogsModel | undefined> {
    const response = await db.insert(processed_logs).values({ log_id: logId }).onConflictDoNothing().returning()
    return response.length === 1 ? response[0] : undefined
  }
}
