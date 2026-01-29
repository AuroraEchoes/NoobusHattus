import { db } from '../lib/db.js'
import type { Command } from './index.js';
import { users } from '../db/schema.js';

export default {
  data: {
    name: 'sorting-hat',
    description: 'Sort yourself into a house!',
  },
  async execute(interaction) {
    interaction.reply({
      content: `Users: \`\`\`\n${(await db.select().from(users)).toString()}\`\`\``
    })
  },
} satisfies Command;
