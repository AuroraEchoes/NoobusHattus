import type { Command } from '../index.js';
import { LogChannel } from '../../db/log-channels.js';

export default {
  data: {
    name: "remove-log-channel",
    description: "Remove the current channel as a log channel",
  },

  // TODO: Add some sort of security verification to ensure the user should be able to run this command
  // DO NOT LAUNCH WITHOUT THIS
  // OR YOUR KNEECAPS WILL BE MINE
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const channelId = BigInt(interaction.channelId);
    const guildId = BigInt(interaction.guildId!);
    await LogChannel.delete(channelId, guildId)
    await interaction.reply(`Removed <#${channelId}> as a log channel`);
  },
} satisfies Command;
