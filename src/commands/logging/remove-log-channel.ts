import type { Command } from '../index.js';
import { LogChannels } from '../../db/log-channels.js';
import { Permission, PermissionManager } from '../../permissions.js';

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
    await LogChannels.delete(channelId, guildId)
    await interaction.reply(`Removed <#${channelId}> as a log channel`);
  },
} satisfies Command;
