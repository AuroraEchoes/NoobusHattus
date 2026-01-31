import { eq, InferSelectModel, sum } from "drizzle-orm";
import { houses, point_actions } from "./schema.js";
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

  static async getPointTotalsBySeason(seasonId: number): Promise<{ house_id: number | null, points: string | null }[]> {
    const pointTotals = await db.select({ house_id: houses.id, points: sum(point_actions.point_value) })
      .from(point_actions)
      .leftJoin(houses, eq(point_actions.house_id, houses.id))
      .where(eq(houses.season_id, seasonId))
      .groupBy(houses.id)
    return pointTotals
  }
}
