import type { Command } from '../index.js';
import { LogChannelModel, LogChannels } from '../../db/log-channels.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { EmbedBuilder } from 'discord.js';

export default {
  data: {
    name: "remove-log-channel",
    description: "Remove the current channel as a log channel",
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const channelId = BigInt(interaction.channelId);
    const guildId = BigInt(interaction.guildId!);
    const logChannel = await LogChannels.delete(channelId, guildId)
    if (logChannel === undefined) {
      await interaction.reply({ embeds: [embedFailure(channelId)], ephemeral: true })
      return
    }
    await interaction.reply({ embeds: [embedSuccess(logChannel)], ephemeral: true })
  },
} satisfies Command;


function embedSuccess(logChannel: LogChannelModel): EmbedBuilder {
  return successEmbed
    .setTitle("Removed Log Channel")
    .setDescription(`<#${logChannel.channel_id}> will no longer log events`)
}

function embedFailure(channelId: bigint): EmbedBuilder {
  return failureEmbed
    .setTitle("Failed to remove Log Channel")
    .setDescription(`<#${channelId}> is likely not a log channel`)
}
