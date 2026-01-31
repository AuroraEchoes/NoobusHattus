import { ApplicationCommandOptionType } from '@discordjs/core';
import { Seasons } from '../../db/seasons.js';
import type { Command } from '../index.js';

export default {
  data: {
    name: 'deactivate-season',
    description: 'Deactivate a season',
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
    const changedSeason = await Seasons.setActive(seasonId, false)
    if (changedSeason === undefined) {
      await interaction.reply(`Nothing changed (either that season doesn’t exist, or was already deactivated)`);
    } else {
      await interaction.reply(`Deactivated Season ${changedSeason.season_name} (\`${changedSeason.id}\`)`);
    }
  },
} satisfies Command;
