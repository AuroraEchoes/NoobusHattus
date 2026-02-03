import { CacheType, CommandInteraction } from 'discord.js';
import { Houses } from '../../db/houses.js';
import { Seasons } from '../../db/seasons.js';
import { Users } from '../../db/users.js';
import type { Command } from '../index.js';
import { Permission, PermissionManager } from '../../permissions.js';

export default {
  data: {
    name: 'sorting-hat',
    description: 'Sort yourself into a house!',
  },
  async execute(interaction) {
    await sortUser(interaction, interaction.user.id)
  },
} satisfies Command;

export async function sortUser(interaction: CommandInteraction<CacheType>, targetDiscordId: string) {
  // Procedure:
  // 1. Cache user (if not already cached)
  // 2. Find active seasons
  // 3. Choose a house for the user for *all* active seasons (we ASSUME this will be one)
  // 4. Assign house, roles, etc. Notify user
  // TODO: Add a role_id param to the house table so that can be assigned
  // Ending a season should unassign all these roles, and we probably need
  // some sort of admin command to mass-manage house roles (TBD)
  if (!PermissionManager.requirePermission(interaction, Permission.USE_BOT)) return
  const user = await Users.findOrCreate(BigInt(targetDiscordId));
  if (user === undefined) {
    interaction.reply("You don’t have an ozfortress.com account linked to your Discord")
    return
  }

  let replyBuf = []

  const activeSeasons = await Seasons.getActive()
  if (activeSeasons.length === 0) {
    interaction.reply("There are no active seasons at the moment")
    return
  }
  for (const activeSeason of activeSeasons) {
    const house = await Houses.getByUserBySeason(user.id, activeSeason.id)
    if (house === undefined) {
      // TODO: Put user in a house
      const newHouse = await Houses.getOrAssignForUser(user.id, activeSeason.id)
      if (newHouse === undefined) {
        replyBuf.push(`Error adding a house for Season ${activeSeason.season_name} (\`${activeSeason.id}\`). Does this season have houses?`)
      }
      else {
        replyBuf.push(`Added to House ${newHouse.house_emoji} ${newHouse.house_name} (\`${newHouse.id}\`) for Season ${activeSeason.season_name} (\`${activeSeason.id}\`)`)
      }
    }
    else {
      replyBuf.push(`Already in House ${house.house_emoji} ${house.house_name} (\`${house.id}\`) for Season ${activeSeason.season_name} (\`${activeSeason.id}\`)`)
    }
  }
  interaction.reply({
    content: replyBuf.join("\n")
  })
}
