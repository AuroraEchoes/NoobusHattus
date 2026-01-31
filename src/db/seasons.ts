import { eq, InferSelectModel } from "drizzle-orm";
import { db } from "../lib/db.js";
import { seasons } from "./schema.js";

export type SeasonModel = InferSelectModel<typeof seasons>;

export class Seasons {
  static async getActive(): Promise<SeasonModel[]> {
    const activeSeasons = await db.select().from(seasons).where(eq(seasons.is_active, true));
    return activeSeasons;
  }

  static async create(name: string): Promise<SeasonModel> {
    const newSeason = await db.insert(seasons)
      .values({ season_name: name, is_active: false })
      .returning()
    return newSeason[0]
  }

  static async get(): Promise<SeasonModel[]> {
    const allSeasons = await db.select().from(seasons).orderBy(seasons.id)
    return allSeasons
  }

  static async getById(seasonId: number): Promise<SeasonModel | undefined> {
    const season = await db.select().from(seasons).where(eq(seasons.id, seasonId))
    return season.length === 1 ? season[0] : undefined
  }

  static async setActive(seasonId: number, isActive: boolean): Promise<undefined | SeasonModel> {
    const updated = await db.update(seasons)
      .set({ is_active: isActive })
      .where(eq(seasons.id, seasonId))
      .returning()
    return updated.length > 0 ? updated[0] : undefined
  }
}
