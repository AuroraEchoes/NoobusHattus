import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "../db/schema.js";
import { eq, InferSelectModel } from "drizzle-orm";
import { citadelQuery } from "./citadel.js";

export const db = drizzle(process.env.DATABASE_URL!);

type User = InferSelectModel<typeof users>;
export async function findOrCreateUser(discordId: string): Promise<User | undefined> {
  const usersQuery = await db.selectDistinct().from(users).where(eq(users.discord_id, BigInt(discordId)))
  if (usersQuery.length === 0) {
    const userInfo = await citadelQuery(`/users/discord_id/${discordId}`)
    console.log(userInfo)
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
