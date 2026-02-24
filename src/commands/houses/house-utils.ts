import { client } from "../../client.js";
import { Houses } from "../../db/houses.js";
import { Seasons } from "../../db/seasons.js";
import { Users } from "../../db/users.js";

export async function hasAssignRolePermission(guildId: bigint) {
  return (await client.guilds.fetch(guildId.toString())).members.me?.permissions.has("ManageRoles")
}

export async function addHouseRole(guildId: bigint, userId: bigint): Promise<boolean> {
  const house = await Houses.getActiveByUserByGuild(userId, guildId)
  if (house === undefined || house.house_role_id === undefined) return false

  const user = await Users.getById(userId)
  if (user === undefined) return false

  return userAddRole(guildId, user.discord_id, house.house_role_id!)
}

export async function userAddRole(guildId: bigint, discordId: bigint, roleId: bigint): Promise<boolean> {
  const guild = await client.guilds.fetch(guildId.toString())
  const member = await guild.members.fetch(discordId.toString())
  const role = await guild.roles.fetch(roleId.toString())

  if (guild === null || member === null || role === null) return false
  if (member.roles.cache.has(role.id)) return false
  try {
    await member.roles.add(role)
    return true
  } catch (error) {
    console.error(`ERR: Could not assign role. ${error}.`)
    return false
  }
}

export async function userRemoveRole(guildId: bigint, discordId: bigint, roleId: bigint): Promise<boolean> {
  const guild = await client.guilds.fetch(guildId.toString())
  const member = await guild.members.fetch(discordId.toString())
  const role = await guild.roles.fetch(roleId.toString())

  if (guild === null || member === null || role === null) return false
  if (!member.roles.cache.has(role.id)) return false
  try {
    await member.roles.remove(role)
    return true
  } catch (error) {
    console.error(`ERR: Could not assign role. ${error}.`)
    return false
  }
}

export async function updateAllHouseRoles(guildId: bigint) {
  const guildSeasons = await Seasons.getByGuild(guildId)
  const guildHouses = (await Promise.all(guildSeasons.map(async (season, _) => await Houses.getBySeason(season.id)))).flat()

  for (const house of guildHouses) {
    if (house.house_role_id === null) continue
    const seasonIsActive = guildSeasons.find(s => s.id == house.season_id)?.is_active
    const users = await Users.getByHouse(house.id)
    for (const user of users) {
      if (seasonIsActive) {
        userAddRole(guildId, user.discord_id, house.house_role_id)
      } else {
        userRemoveRole(guildId, user.discord_id, house.house_role_id)
      }
    }
  }
}

export async function removeSeasonHouseRoles(seasonId: number) {
  const season = await Seasons.getById(seasonId)
  if (season === undefined) return
  const houses = await Houses.getBySeason(seasonId)
  for (const house of houses) {
    if (house.house_role_id === null) continue
    const houseUsers = await Users.getByHouse(house.id)
    for (const user of houseUsers) {
      userRemoveRole(season.guild_id, user.discord_id, house.house_role_id)
    }
  }
}
