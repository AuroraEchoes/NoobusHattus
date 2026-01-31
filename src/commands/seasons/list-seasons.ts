import { Seasons } from '../../db/seasons.js';
import type { Command } from '../index.js';

export default {
  data: {
    name: 'list-seasons',
    description: 'List all seasons',
  },

  // TODO: Add some sort of security verification to ensure the user should be able to run this command
  // DO NOT LAUNCH WITHOUT THIS
  // OR YOUR KNEECAPS WILL BE MINE
  async execute(interaction) {
    const allSeasons = await Seasons.get()
    let replyBuf = []
    for (const season of allSeasons) {
      replyBuf.push(`\`${season.id}\`: ${season.season_name} (${season.is_active ? "Active" : "Inactive"})`)
    }
    await interaction.reply(replyBuf.join("\n"))
  },
} satisfies Command;
