import { ApplicationCommandOptionType } from '@discordjs/core';
import type { Command } from './index.js';
import { ActionManager } from '../actions.js';
import { Permission, PermissionManager } from '../permissions.js';
import { successEmbed } from '../lib/embeds.js';
import { EmbedBuilder, MessageFlags } from 'discord.js';

export default {
  data: {
    name: "award-points",
    description: "Give the target player points",
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: "target",
        description: "Target (point recipient)",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Integer,
        name: "amount",
        description: "Number of points to award",
        required: true
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "reason",
        description: "Reason for point award",
        required: true
      }
    ]
  },

  async execute(interaction) {
    if (!(await PermissionManager.requirePermission(interaction, Permission.AWARD_POINTS))) return

    if (!interaction.isChatInputCommand()) return;
    const target = BigInt(interaction.options.getUser("target")!.id)
    const amount = interaction.options.getInteger("amount")!
    const reason = interaction.options.getString("reason")!
    const source = BigInt(interaction.user.id)
    const guildId = BigInt(interaction.guildId!)

    await ActionManager.applyActionAsUser(guildId, target, source, reason, amount)
    await interaction.reply({ embeds: [embedSuccess(target, amount, reason)], flags: MessageFlags.Ephemeral });
  },
} satisfies Command;

function embedSuccess(userDiscordId: bigint, quantity: number, reason: string): EmbedBuilder {
  return successEmbed
    .setTitle("Awarded points")
    .setFields([
      { name: "Target", value: `<@${userDiscordId}>` },
      { name: "Quantity", value: `${quantity}` },
      { name: "Reason", value: `${reason}` }
    ])
}
