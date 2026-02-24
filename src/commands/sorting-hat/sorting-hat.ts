import { CacheType, CommandInteraction, EmbedBuilder } from 'discord.js';
import { HouseModel, Houses } from '../../db/houses.js';
import { SeasonModel, Seasons } from '../../db/seasons.js';
import { Users } from '../../db/users.js';
import type { Command } from '../index.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';

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

  let embeds = []

  const activeSeasons = await Seasons.getActive()
  if (activeSeasons.length === 0) {
    await interaction.reply({ embeds: [embedNoActiveSeasons()], ephemeral: true });
    return
  }

  for (const activeSeason of activeSeasons) {
    const house = await Houses.getByUserBySeason(user.id, activeSeason.id)
    if (house === undefined) {
      // TODO: Put user in a house
      const newHouse = await Houses.getOrAssignForUser(user.id, activeSeason.id)
      if (newHouse === undefined) {
        embeds.push(embedNoHouses(activeSeason))
      }
      else {
        embeds.push(embedSuccess(newHouse, activeSeason))
      }
    }
    else {
      embeds.push(embedAlreadyInHouse(house, activeSeason))
    }
  }
  await interaction.reply({
    embeds: embeds,
    ephemeral: true
  })
}

function embedSuccess(house: HouseModel, season: SeasonModel): EmbedBuilder {
  return successEmbed
    .setTitle("The Sorting Hat has decided your fate")
    .setDescription(`You are now a member of **${house.house_emoji} ${house.house_name}** for ${season.season_name}. Do your house proud. Good luck!`)
}

function embedNoHouses(season: SeasonModel): EmbedBuilder {
  return failureEmbed
    .setTitle("Could not sort")
    .setDescription(`Error sorting into a house for ${season.season_name} (\`${season.id}\`). Does this season have houses?`)
}

function embedAlreadyInHouse(house: HouseModel, season: SeasonModel): EmbedBuilder {
  return failureEmbed
    .setTitle("Already in a house")
    .setDescription(`Already in **${house.house_emoji} ${house.house_name}** (\`${house.id}\`) for Season ${season.season_name} (\`${season.id}\`)`)
}

function embedNoActiveSeasons(): EmbedBuilder {
  return failureEmbed
    .setTitle("No active seasons")
    .setDescription(`There are no active seasons.`)
}
