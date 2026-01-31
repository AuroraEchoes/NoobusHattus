import { ApplicationCommandOptionType } from '@discordjs/core';
import { Seasons } from '../../db/seasons.js';
import type { Command } from '../index.js';
import { LogChannels } from '../../db/log-channels.js';

export default {
  data: {
    name: "add-log-channel",
    description: "Add the current channel as a log channel (to log actions for a season)",
    options: [
      {
        type: ApplicationCommandOptionType.Integer,
        name: "season-id",
        description: "Season ID",
        required: true,
      }
    ]
  },

  // TODO: Add some sort of security verification to ensure the user should be able to run this command
  // DO NOT LAUNCH WITHOUT THIS
  // OR YOUR KNEECAPS WILL BE MINE
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const seasonId = interaction.options.getInteger("season-id")!
    const channelId = BigInt(interaction.channelId);
    const guildId = BigInt(interaction.guildId!);
    const season = await Seasons.getById(seasonId)
    await LogChannels.create(seasonId, channelId, guildId)
    await interaction.reply(`Setup <#${channelId}> to log messages for Season ${season?.season_name} (\`${season?.id}\`)`);
  },
} satisfies Command;
