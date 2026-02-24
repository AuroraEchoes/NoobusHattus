import type { Command } from '../index.js';
import { Permission, PermissionManager } from "../../permissions.js";
import { Houses } from '../../db/houses.js';
import { Users } from '../../db/users.js';
import { couldNotAssignRoleEmbed, failureEmbed, successEmbed } from '../../lib/embeds.js';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { addHouseRole } from './house-utils.js';

export default {
  data: {
    name: 'house-reassign-role',
    description: 'Reassign your house’s role (debug)',
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.USE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const discordId = BigInt(interaction.user.id)
    const guildId = BigInt(interaction.guildId!)
    const user = await Users.getByDiscordId(discordId)
    if (user === undefined) return

    const house = await Houses.getActiveByUserByGuild(user.id, guildId)
    if (house === undefined) {
      await interaction.reply({ embeds: [embedNotInHouse()], flags: MessageFlags.Ephemeral });
      return
    }

    if (house.house_role_id === null) {
      await interaction.reply({ embeds: [embedHouseHasNoRole()], flags: MessageFlags.Ephemeral });
      return
    }

    if (await addHouseRole(guildId, user.id)) {
      await interaction.reply({ embeds: [embedSuccess(house.house_role_id)], flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ embeds: [couldNotAssignRoleEmbed], flags: MessageFlags.Ephemeral });
    }
  },
} satisfies Command;

function embedSuccess(roleId: bigint): EmbedBuilder {
  return successEmbed
    .setTitle("House role added")
    .setDescription(`You now have the role <@&${roleId}>`)
    .setFields([])
}

function embedNotInHouse(): EmbedBuilder {
  return failureEmbed
    .setTitle("You are not in a house")
    .setDescription(`You are not in a house in an active season, in this server`)
    .setFields([])
}

function embedHouseHasNoRole(): EmbedBuilder {
  return failureEmbed
    .setTitle("House has no role")
    .setDescription(`The house you are in has no associated role`)
    .setFields([])
}
