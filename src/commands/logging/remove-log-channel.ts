import type { Command } from '../index.js';
import { LogChannelModel, LogChannels } from '../../db/log-channels.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { EmbedBuilder, MessageFlags } from 'discord.js';

export default {
  data: {
    name: "remove-log-channel",
    description: "Remove log channel",
  },

  async execute(interaction) {
    if (!(await PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT))) return
    if (!interaction.isChatInputCommand()) return;
    const guildId = BigInt(interaction.guildId!);
    const logChannel = await LogChannels.getByGuild(guildId)
    if (logChannel === undefined) {
      await interaction.reply({ embeds: [embedFailure()], flags: MessageFlags.Ephemeral })
      return
    }
    await LogChannels.delete(logChannel.channel_id, logChannel.guild_id)
    await interaction.reply({ embeds: [embedSuccess(logChannel)], flags: MessageFlags.Ephemeral })
  },
} satisfies Command;


function embedSuccess(logChannel: LogChannelModel): EmbedBuilder {
  return successEmbed
    .setTitle("Removed Log Channel")
    .setDescription(`<#${logChannel.channel_id}> will no longer log events`)
    .setFields([])
}

function embedFailure(): EmbedBuilder {
  return failureEmbed
    .setTitle("No log channel found")
    .setDescription(`This server does not have a log channel setup. Use /query-log-channel to query the log channel.`)
    .setFields([])
}
