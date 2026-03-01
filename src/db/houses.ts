import { and, count, eq, InferSelectModel } from "drizzle-orm";
import { houses, seasons, user_houses } from "./schema.js";
import { db } from "../lib/db.js";

export type HouseModel = InferSelectModel<typeof houses>;

export class Houses {
  static async getBySeason(seasonId: number): Promise<HouseModel[]> {
    const seasonHouses = await db.select().from(houses).where(eq(houses.season_id, seasonId));
    return seasonHouses;
  }

  static async getByUserBySeason(userId: bigint, seasonId: number): Promise<HouseModel | undefined> {
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

  static async getActiveByUserByGuild(userId: bigint, guildId: bigint): Promise<HouseModel | undefined> {
    const [house] = await db.select()
      .from(houses)
      .innerJoin(user_houses, eq(user_houses.house_id, houses.id))
      .innerJoin(seasons, eq(houses.season_id, seasons.id))
      .where(and(eq(user_houses.user_id, userId), eq(seasons.guild_id, guildId)))
      .limit(1);
    return house?.houses
  }

  static async getByGuild(guildId: bigint): Promise<HouseModel[]> {
    const housesQuery = await db.select()
      .from(houses)
      .innerJoin(seasons, eq(houses.season_id, seasons.id))
      .where(eq(seasons.guild_id, guildId))
    return housesQuery.map((x, _) => x.houses)
  }

  static async getByUser(userId: bigint): Promise<HouseModel[]> {
    const housesRet = await db.select()
      .from(houses)
      .innerJoin(user_houses, eq(houses.id, user_houses.house_id))
      .where(eq(user_houses.user_id, userId))
    return housesRet.map((h, _) => h.houses)
  }

  static async getById(houseId: number): Promise<HouseModel | undefined> {
    const house = await db.select().from(houses).where(eq(houses.id, houseId))
    return house.length === 1 ? house[0] : undefined
  }

  static async getOrAssignForUser(userId: bigint, seasonId: number): Promise<HouseModel | undefined> {
    // Ensure the user isn’t already in a house
    const userHouses = await db.select()
      .from(houses)
      .leftJoin(user_houses, eq(houses.id, user_houses.house_id))
      .where(and(eq(user_houses.user_id, userId), eq(houses.season_id, seasonId)))

    if (userHouses.length > 0) {
      // We assume that a user can only be in one house per season
      return userHouses[0].houses
    }

    // Assign to a random selection of the smallest houses
    const seasonHouses = await db.select({ id: houses.id, count: count(user_houses.user_id) })
      .from(houses)
      .where(eq(houses.season_id, seasonId))
      .leftJoin(user_houses, eq(houses.id, user_houses.house_id))
      .groupBy(houses.id)

    if (seasonHouses.length === 0) {
      console.warn(`Tried to assign ${userId} to a house for season ${seasonId} but there were no houses`)
      return undefined
    }
    const minCount = seasonHouses.map((val, _) => val.count).reduce((acc, curr) => Math.min(acc, curr))
    const viableHouses = seasonHouses.filter(house => house.count == minCount)
    const chosenIdx = Math.floor(Math.random() * viableHouses.length)
    const chosenHouse = viableHouses[chosenIdx]
    const house = (await db.select().from(houses).where(eq(houses.id, chosenHouse.id)))[0]

    // Add user to the house
    await db.insert(user_houses).values({ user_id: userId, house_id: house.id, season_id: seasonId })
    return house
  }

  static async create(seasonId: number, houseName: string, houseEmoji: string, houseRoleId: bigint | undefined): Promise<HouseModel> {
    // Check the referenced season exists
    const house = await db
      .insert(houses)
      .values({ house_name: houseName, house_emoji: houseEmoji, season_id: seasonId, house_role_id: houseRoleId })
      .returning()
    return house[0]
  }
}
