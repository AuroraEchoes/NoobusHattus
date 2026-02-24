import type { Command } from '../index.js';
import { LogChannelModel, LogChannels } from '../../db/log-channels.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
  data: {
    name: "remove-log-channel",
    description: "Remove channel as a log channel (will use current channel if a channel is not provided)",
    options: [
      {
        type: ApplicationCommandOptionType.Channel,
        name: "channel",
        description: "Target channel",
        required: false,
      }
    ]
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const channelParam = interaction.options.getChannel("channel")
    const channelId = channelParam === null ? BigInt(interaction.channelId) : BigInt(channelParam.id)
    const guildId = BigInt(interaction.guildId!);
    const logChannel = await LogChannels.delete(channelId, guildId)
    if (logChannel === undefined) {
      await interaction.reply({ embeds: [embedFailure(channelId)], flags: MessageFlags.Ephemeral })
      return
    }
    await interaction.reply({ embeds: [embedSuccess(logChannel)], flags: MessageFlags.Ephemeral })
  },
} satisfies Command;


function embedSuccess(logChannel: LogChannelModel): EmbedBuilder {
  return successEmbed
    .setTitle("Removed Log Channel")
    .setDescription(`<#${logChannel.channel_id}> will no longer log events`)
    .setFields([])
}

function embedFailure(channelId: bigint): EmbedBuilder {
  return failureEmbed
    .setTitle("Failed to remove Log Channel")
    .setDescription(`<#${channelId}> is likely not a log channel`)
    .setFields([])
}
