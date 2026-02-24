import { ApplicationCommandOptionType } from '@discordjs/core';
import type { Command } from './index.js';
import { ActionManager } from '../actions.js';
import { Permission, PermissionManager } from '../permissions.js';
import { failureEmbed, successEmbed } from '../lib/embeds.js';
import { PointActionModel } from '../db/point-actions.js';
import { EmbedBuilder } from 'discord.js';

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
    if (!PermissionManager.requirePermission(interaction, Permission.AWARD_POINTS)) return


    if (!interaction.isChatInputCommand()) return;
    const target = BigInt(interaction.options.getUser("target")!.id)
    const amount = interaction.options.getInteger("amount")!
    const reason = interaction.options.getString("reason")!
    const source = BigInt(interaction.user.id)

    const result = await ActionManager.applyActionAsUser(target, source, reason, amount)
    if (result === undefined || result.length === 0) {
      await interaction.reply({ embeds: [embedFailure(target)], ephemeral: true });
    }
    else {
      await interaction.reply({ embeds: [embedSuccess(target, result[0])], ephemeral: true });
    }
  },
} satisfies Command;

function embedSuccess(userDiscordId: bigint, action: PointActionModel): EmbedBuilder {
  return successEmbed
    .setTitle("Awarded points")
    .setFields([
      { name: "Target", value: `<@${userDiscordId}>` },
      { name: "Quantity", value: `${action.point_value}` },
      { name: "Reason", value: `${action.reason}` }
    ])
}

function embedFailure(targetId: bigint): EmbedBuilder {
  return failureEmbed
    .setTitle("Failed to award points")
    .setDescription(`Could not award points to <@${targetId}> (are they a member of an active house?)`)
}
