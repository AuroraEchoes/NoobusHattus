import { and, eq, InferSelectModel } from "drizzle-orm";
import { db } from "../lib/db.js";
import { seasons } from "./schema.js";

export type SeasonModel = InferSelectModel<typeof seasons>;

type SetActiveResult = | { ok: true, season: SeasonModel | undefined } | { ok: false }

export class Seasons {
  static async getActive(guildId: bigint): Promise<SeasonModel | undefined> {
    const [season] = await db.select()
      .from(seasons)
      .where(and(eq(seasons.guild_id, guildId), eq(seasons.is_active, true)))
      .limit(1);
    return season;
  }

  static async create(guildId: bigint, name: string): Promise<SeasonModel> {
    const [season] = await db.insert(seasons)
      .values({ guild_id: guildId, season_name: name, is_active: false })
      .returning()
    return season;
  }

  static async getByGuild(guildId: bigint): Promise<SeasonModel[]> {
    const allSeasons = await db.select()
      .from(seasons)
      .where(eq(seasons.guild_id, guildId))
      .orderBy(seasons.id)
    return allSeasons
  }

  static async getById(seasonId: number): Promise<SeasonModel | undefined> {
    const [season] = await db.select().from(seasons).where(eq(seasons.id, seasonId)).limit(1)
    return season
  }


  static async setActive(seasonId: number, isActive: boolean): Promise<SetActiveResult> {
    try {
      const [season] = await db.update(seasons)
        .set({ is_active: isActive })
        .where(eq(seasons.id, seasonId))
        .returning()
      return { ok: true, season: season }
    } catch (error) {
      return { ok: false }
    }
  }

  static async existsInServer(seasonId: number, guildId: bigint): Promise<boolean> {
    const season = await Seasons.getById(seasonId)
    if (season === undefined)
      return false
    return season.guild_id === guildId
  }
}
