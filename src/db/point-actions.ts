import { desc, eq, InferSelectModel, sql } from "drizzle-orm";
import { houses, point_actions, users } from "./schema.js";
import { db } from "../lib/db.js";

export type PointActionModel = InferSelectModel<typeof point_actions>;

export class PointActions {
  static async insert(target: number, houseId: number, source: bigint | undefined, reason: string, value: number): Promise<PointActionModel | undefined> {
    // Don’t look at what I’m doing to target_id here please and thank you
    const action = await db.insert(point_actions)
      .values({ target_id: target, source_user_id: source, reason: reason, point_value: value, house_id: houseId })
      .returning()
    return action.length === 1 ? action[0] : undefined
  }

  static async getPointTotalsBySeason(seasonId: number): Promise<{ house_id: number | null, points: number | null }[]> {
    const pointTotals = await db.select(
      {
        house_id: houses.id,
        points: sql<number>`SUM(${point_actions.point_value})::int`
      })
      .from(point_actions)
      .leftJoin(houses, eq(point_actions.house_id, houses.id))
      .where(eq(houses.season_id, seasonId))
      .groupBy(houses.id)
    return pointTotals
  }

  static async getPointLeaderboardIndividual(seasonId: number, limit: number): Promise<{ user_id: bigint | null, points: number }[]> {
    const pointTotals = await db.select(
      {
        user_id: users.id,
        points: sql<number>`SUM(${point_actions.point_value})::int`
      })
      .from(point_actions)
      .leftJoin(houses, eq(point_actions.house_id, houses.id))
      .leftJoin(users, eq(point_actions.target_id, users.id))
      .where(eq(houses.season_id, seasonId))
      .groupBy(users.id)
      .orderBy(desc(sql`SUM(${point_actions.point_value})::int`))
      .limit(limit)
    return pointTotals
  }
}
