import { ApplicationCommandOptionType } from '@discordjs/core';
import { Seasons } from '../../db/seasons.js';
import type { Command } from '../index.js';
import { Permission, PermissionManager } from '../../permissions.js';

export default {
  data: {
    name: 'activate-season',
    description: 'Activate a season',
    options: [
      {
        type: ApplicationCommandOptionType.Integer,
        name: "season-id",
        description: "Season ID",
        required: true,
      }
    ]
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const seasonId = interaction.options.getInteger("season-id")!
    const changedSeason = await Seasons.setActive(seasonId, true)
    if (changedSeason === undefined) {
      await interaction.reply(`Nothing changed (either that season doesn’t exist, or was already activated)`);
    } else {
      await interaction.reply(`Activated Season ${changedSeason.season_name} (\`${changedSeason.id}\`)`);
    }
  },
} satisfies Command;
