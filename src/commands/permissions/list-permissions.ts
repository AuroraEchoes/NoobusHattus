import type { Command } from '../index.js';
import { Permission, PermissionManager } from "../../permissions.js";
import { PermissionRoles } from "../../db/permission-roles.js";
import { successEmbed } from '../../lib/embeds.js';
import { EmbedBuilder, MessageFlags } from 'discord.js';

export default {
  data: {
    name: "list-permissions",
    description: "List all roles and their permissions",
  },

  async execute(interaction) {
    if (!(await PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT))) return
    if (!interaction.isChatInputCommand()) return;

    const permissionNames = Object.values(Permission).filter(val => typeof val === "string")
    const map: Map<string, bigint[]> = new Map();
    for (const permission of permissionNames) {
      const rolesWithPermission = await PermissionRoles.getRolesWithPermission(permission as unknown as Permission)
      map.set(permission, Array.from(rolesWithPermission.map((val, _) => val.role_id).filter(x => x !== null)))
    }
    await interaction.reply({ embeds: [embedSuccess(map)], flags: MessageFlags.Ephemeral });
  },
} satisfies Command;

function embedSuccess(permissions: Map<string, bigint[]>): EmbedBuilder {
  return successEmbed
    .setTitle("Permissions List")
    .setDescription(" ")
    .setFields(
      Array.from(permissions.entries()).map(([key, roles]) => ({
        name: key,
        value: roles.map(role => `<@&${role}>`).join(", ") || "None"
      }))
    );
}
