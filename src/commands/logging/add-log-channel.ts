import { ApplicationCommandOptionType } from '@discordjs/core';
import type { Command } from '../index.js';
import { LogChannelModel, LogChannels } from '../../db/log-channels.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { EmbedBuilder, MessageFlags } from 'discord.js';

export default {
  data: {
    name: "add-log-channel",
    description: "Add channel as a log channel (will use current channel if a channel is not provided)",
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
    if (!(await PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT))) return
    if (!interaction.isChatInputCommand()) return;
    const channelParam = interaction.options.getChannel("channel")
    const channelId = channelParam === null ? BigInt(interaction.channelId) : BigInt(channelParam.id)
    const guildId = BigInt(interaction.guildId!);

    const existingLogChannel = await LogChannels.getByGuild(guildId)
    if (existingLogChannel !== undefined) {
      await interaction.reply({ embeds: [embedFailureOneLogChannelPerServer(existingLogChannel)], flags: MessageFlags.Ephemeral })
      return
    }

    const logChannel = await LogChannels.create(channelId, guildId)
    if (logChannel === undefined) {
      await interaction.reply({ embeds: [embedFailureLogChannel(channelId)], flags: MessageFlags.Ephemeral })
      return
    }

    await interaction.reply({ embeds: [embedSuccess(logChannel)], flags: MessageFlags.Ephemeral })
  },
} satisfies Command;

function embedSuccess(logChannel: LogChannelModel): EmbedBuilder {
  return successEmbed
    .setTitle("Added Log Channel")
    .setDescription(`<#${logChannel.channel_id}> will now log events for the active season`)
    .setFields([])
}

function embedFailureLogChannel(channelId: bigint): EmbedBuilder {
  return failureEmbed
    .setTitle("Failed to add Log Channel")
    .setDescription(`<#${channelId}> could not be added as a log channel. Is there already a season logging in this channel? This can be checked using \`/list-log-channels\`.`)
    .setFields([])
}

function embedFailureOneLogChannelPerServer(existing: LogChannelModel): EmbedBuilder {
  return failureEmbed
    .setTitle("There is already a log channel in this server")
    .setDescription(`Logging is already set up in <#${existing.channel_id}>. There may only be one log channel per server.`)
    .setFields([])
}
