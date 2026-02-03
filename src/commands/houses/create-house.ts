import { ApplicationCommandOptionType } from '@discordjs/core';
import type { Command } from '../index.js';
import { Houses } from '../../db/houses.js';
import { Permission, PermissionManager } from '../../permissions.js';

export default {
  data: {
    name: "create-house",
    description: "Create a new season",
    options: [
      {
        type: ApplicationCommandOptionType.Integer,
        name: "season-id",
        description: "Season ID to create the house within",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "house-name",
        description: "House name",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "house-emoji",
        description: "House emoji (or prefix)",
        required: true,
      },
    ]
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const seasonId = interaction.options.getInteger("season-id")!
    const houseName = interaction.options.getString("house-name")!
    const houseEmoji = interaction.options.getString("house-emoji")!
    const house = await Houses.create(seasonId, houseName, houseEmoji)
    await interaction.reply(`Created House ${house.house_emoji} ${house.house_name} (\`${house.id}\`)`);
  },
} satisfies Command;
