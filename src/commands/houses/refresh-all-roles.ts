import type { Command } from '../index.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { couldNotAssignRoleEmbed, successEmbed } from '../../lib/embeds.js';
import { hasAssignRolePermission, updateAllHouseRoles } from './house-utils.js';

export default {
  data: {
    name: "refresh-all-roles",
    description: "Refreshes all roles for all season in this guild (this may take a while)",
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;

    if (!hasAssignRolePermission(BigInt(interaction.guildId!))) {
      await interaction.reply({ embeds: [couldNotAssignRoleEmbed], flags: MessageFlags.Ephemeral });
      return
    }

    await updateAllHouseRoles(BigInt(interaction.guildId!))
    await interaction.reply({ embeds: [embed()], flags: MessageFlags.Ephemeral });
  },
} satisfies Command;

function embed(): EmbedBuilder {
  return successEmbed
    .setTitle("Refreshed all roles")
    .setFields([])
}
