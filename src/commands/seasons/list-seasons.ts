import { Seasons } from '../../db/seasons.js';
import { Permission, PermissionManager } from '../../permissions.js';
import type { Command } from '../index.js';

export default {
  data: {
    name: 'list-seasons',
    description: 'List all seasons',
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    const allSeasons = await Seasons.get()
    let replyBuf = []
    for (const season of allSeasons) {
      replyBuf.push(`\`${season.id}\`: ${season.season_name} (${season.is_active ? "Active" : "Inactive"})`)
    }
    await interaction.reply(replyBuf.join("\n"))
  },
} satisfies Command;
