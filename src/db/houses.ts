import { and, count, eq, InferSelectModel } from "drizzle-orm";
import { houses, user_houses } from "./schema.js";
import { db } from "../lib/db.js";

export type HouseModel = InferSelectModel<typeof houses>;

export class Houses {
  static async getBySeason(seasonId: number): Promise<HouseModel[]> {
    const seasonHouses = await db.select().from(houses).where(eq(houses.season_id, seasonId));
    return seasonHouses;
  }

  static async getbyUserBySeason(userId: bigint, seasonId: number): Promise<HouseModel | undefined> {
    const inHouse = await db.select().from(user_houses).where(and(
      eq(user_houses.user_id, userId),
      eq(user_houses.season_id, seasonId)
    ))

    if (inHouse.length === 0) {
      return undefined
    }

    const house = await db.select().from(houses).where(eq(houses.id, inHouse[0].house_id))
    return house[0];
  }

  static async getOrAssignForUser(userId: bigint, seasonId: number): Promise<HouseModel | undefined> {
    // Ensure the user isn’t already in a house
    const userHouses = await db.select()
      .from(houses)
      .leftJoin(user_houses, eq(houses.id, user_houses.house_id))
      .where(eq(user_houses.user_id, userId))

    if (userHouses.length > 0) {
      // We assume that a user can only be in one house per season
      return userHouses[0].houses
    }

    // Assign to a random selection of the smallest houses
    const seasonHouses = await db.select({ id: houses.id, count: count(user_houses.user_id) })
      .from(houses)
      .where(eq(user_houses.season_id, seasonId))
      .leftJoin(user_houses, eq(houses.id, user_houses.house_id))
      .groupBy(user_houses.house_id)

    if (seasonHouses.length === 0) {
      console.warn(`Tried to assign ${userId} to a house for season ${seasonId}`)
      return undefined
    }
    const minCount = seasonHouses.map((val, _) => val.count).reduce((acc, curr) => Math.min(acc, curr))
    const viableHouses = seasonHouses.filter(house => house.count == minCount)
    const chosenIdx = Math.floor(Math.random() * viableHouses.length)
    const chosenHouse = viableHouses[chosenIdx]
    const house = await db.select().from(houses).where(eq(houses.id, chosenHouse.id))
    return house[0]
  }

  static async create(seasonId: number, houseName: string, houseEmoji: string): Promise<HouseModel> {
    // Check the referenced season exists
    const house = await db
      .insert(houses)
      .values({ house_name: houseName, house_emoji: houseEmoji, season_id: seasonId })
      .returning()
    return house[0]
  }
}
