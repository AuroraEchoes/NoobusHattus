import { CacheType, CommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { HouseModel, Houses } from '../../db/houses.js';
import { SeasonModel, Seasons } from '../../db/seasons.js';
import { Users } from '../../db/users.js';
import type { Command } from '../index.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { addHouseRole } from '../houses/house-utils.js';

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
  if (!PermissionManager.requirePermission(interaction, Permission.USE_BOT)) return
  const user = await Users.findOrCreate(BigInt(targetDiscordId));

  if (user === undefined) {
    await interaction.reply({ embeds: [embedNoLinkedOzfAccount()], flags: MessageFlags.Ephemeral });
    return
  }

  const guildId = BigInt(interaction.guildId!)

  const activeSeason = await Seasons.getActive(guildId)
  if (activeSeason === undefined) {
    await interaction.reply({ embeds: [embedNoActiveSeasons()], flags: MessageFlags.Ephemeral });
    return
  }

  const curHouse = await Houses.getByUserBySeason(user.id, activeSeason.id)
  if (curHouse === undefined) {
    const newHouse = await Houses.getOrAssignForUser(user.id, activeSeason.id)
    await addHouseRole(guildId, user.id)

    if (newHouse === undefined) {
      await interaction.reply({ embeds: [embedNoHouses(activeSeason)], flags: MessageFlags.Ephemeral });
    }
    else {
      await interaction.reply({ embeds: [embedSuccess(BigInt(targetDiscordId), newHouse, activeSeason)] });
    }
  }
  else {
    await interaction.reply({ embeds: [embedAlreadyInHouse(curHouse, activeSeason)], flags: MessageFlags.Ephemeral });
  }
}

function embedSuccess(discordId: bigint, house: HouseModel, season: SeasonModel): EmbedBuilder {
  return successEmbed
    .setTitle("The Sorting Hat has decided your fate")
    .setDescription(`<@${discordId}>, you are now a member of **${house.house_emoji} ${house.house_name}** for ${season.season_name}. Do your house proud. Good luck!`)
    .setFields([])
}

function embedNoHouses(season: SeasonModel): EmbedBuilder {
  return failureEmbed
    .setTitle("Could not sort")
    .setDescription(`Error sorting into a house for ${season.season_name} (\`${season.id}\`). Does this season have houses?`)
    .setFields([])
}

function embedAlreadyInHouse(house: HouseModel, season: SeasonModel): EmbedBuilder {
  return failureEmbed
    .setTitle("Already in a house")
    .setDescription(`Already in **${house.house_emoji} ${house.house_name}** (\`${house.id}\`) for Season ${season.season_name} (\`${season.id}\`)`)
    .setFields([])
}

function embedNoActiveSeasons(): EmbedBuilder {
  return failureEmbed
    .setTitle("No active season")
    .setDescription(`There are no active season.`)
    .setFields([])
}

function embedNoLinkedOzfAccount(): EmbedBuilder {
  return failureEmbed
    .setTitle("No linked \`ozfortress.com\` account")
    .setDescription(`You must link your Discord to your \`ozfortres.com\` account. Do this in Settings → Connections, then try again.`)
    .setFields([])
}
