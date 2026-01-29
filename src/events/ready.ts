import { Events } from 'discord.js';
import type { Event } from './index.js';
import { deployCommands } from '../util/deploy.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    await deployCommands();
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
} satisfies Event<Events.ClientReady>;
