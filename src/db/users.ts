import { eq, InferSelectModel } from "drizzle-orm";
import { users } from "./schema.js";
import { db } from "../lib/db.js";
import { citadelQuery } from "../lib/citadel.js";

export type UserModel = InferSelectModel<typeof users>;

export class Users {
  static async findOrCreate(discordId: bigint): Promise<UserModel | undefined> {
    const usersQuery = await db.selectDistinct().from(users).where(eq(users.discord_id, BigInt(discordId)))
    if (usersQuery.length === 0) {
      const userInfo = await citadelQuery(`/users/discord_id/${discordId}`)
      if (userInfo === undefined) {
        return undefined;
      }
      else {
        const id: number = userInfo.user.id;
        const steamId: string = userInfo.user.steam_64_str;
        await db.insert(users).values({ id: BigInt(id), steam_id: BigInt(steamId), discord_id: BigInt(discordId) });
        const usersQuery = await db.selectDistinct().from(users).where(eq(users.discord_id, BigInt(discordId)));
        return usersQuery[0];
      }
    }
    else {
      return usersQuery[0];
    }
  }

  static async getById(userId: bigint): Promise<UserModel | undefined> {
    const user = await db.select().from(users).where(eq(users.id, userId))
    return user.length === 1 ? user[0] : undefined
  }

  static async getByDiscordId(discordId: bigint): Promise<UserModel | undefined> {
    const user = await db.select().from(users).where(eq(users.discord_id, discordId))
    return user.length === 1 ? user[0] : undefined
  }

  static async getBySteamId(steamId: bigint): Promise<UserModel | undefined> {
    const user = await db.select().from(users).where(eq(users.steam_id, steamId))
    return user.length === 1 ? user[0] : undefined
  }
}
