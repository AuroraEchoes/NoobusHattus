import { findOrCreateUser } from '../lib/db.js'
import type { Command } from './index.js';

export default {
  data: {
    name: 'sorting-hat',
    description: 'Sort yourself into a house!',
  },
  async execute(interaction) {
    const user = await findOrCreateUser(interaction.user.id);
    interaction.reply({
      content: `User: ${user?.id}`
    })
  },
} satisfies Command;
