import { ApplicationCommandOptionType } from '@discordjs/core';
import { Seasons } from '../../db/seasons.js';
import type { Command } from '../index.js';
import { Permission, PermissionManager } from '../../permissions.js';

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

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const seasonName = interaction.options.getString("season-name")!
    const newSeason = await Seasons.create(seasonName)
    await interaction.reply(`Created Season ${newSeason.season_name} (\`${newSeason.id}\`)`);
  },
} satisfies Command;
