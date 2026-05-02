import { eq, InferSelectModel } from "drizzle-orm";
import { season_multipliers } from "./schema.js";
import { db } from "../lib/db.js";

export type SeasonMultiplierModel = InferSelectModel<typeof season_multipliers>

export class SeasonMultipliers {
  static async setBySeason(seasonId: number, multiplier: number): Promise<void> {
    await db.insert(season_multipliers)
      .values({ season_id: seasonId, point_multiplier: multiplier })
      .onConflictDoUpdate({
        target: season_multipliers.season_id,
        set: {
          point_multiplier: multiplier
        }
      })
  }

  static async getBySeason(seasonId: number): Promise<SeasonMultiplierModel | undefined> {
    const seasonMults = await db.select()
      .from(season_multipliers)
      .where(eq(season_multipliers.season_id, seasonId))
    if (seasonMults.length === 1) {
      return seasonMults[0]
    }
    else if (seasonMults.length === 0) {
      const newMults = await db.insert(season_multipliers)
        .values({ season_id: seasonId })
        .returning()
      return newMults[0]
    }
    return undefined
  }
}
