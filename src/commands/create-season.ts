import { ApplicationCommandOptionType } from '@discordjs/core';
import { Seasons } from '../db/seasons.js';
import type { Command } from './index.js';

export default {
  data: {
    name: 'create-season',
    description: 'Create a new season',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "season-name",
        description: "Season name",
        required: true,
      }
    ]
  },

  // TODO: Add some sort of security verification to ensure the user should be able to run this command
  // DO NOT LAUNCH WITHOUT THIS
  // OR YOUR KNEECAPS WILL BE MINE
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const seasonName = interaction.options.getString("season-name")!
    const newSeason = await Seasons.create(seasonName)
    await interaction.reply(`Created Season ${newSeason.season_name} (\`${newSeason.id}\`)`);
  },
} satisfies Command;
