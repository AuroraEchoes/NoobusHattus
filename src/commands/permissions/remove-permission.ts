import { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } from "discord.js";
import type { Command } from '../index.js';
import { Permission, PermissionManager } from "../../permissions.js";
import { PermissionRoles } from "../../db/permission-roles.js";
import { permissionChoices } from "./permission-utils.js";
import { failureEmbed, successEmbed } from "../../lib/embeds.js";

export default {
  data: {
    name: "remove-permission",
    description: "Remove the selected permission from target role",
    options: [
      {
        type: ApplicationCommandOptionType.Role,
        name: "role",
        description: "Target role",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "permission",
        description: "Permission to remove",
        required: true,
        choices: permissionChoices()
      }
    ]
  },

  async execute(interaction) {
    if (!(await PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT))) return
    if (!interaction.isChatInputCommand()) return;
    const role = interaction.options.getRole("role")!
    const permission = interaction.options.getString("permission")! as unknown as Permission
    const alreadyHasRole = (await PermissionRoles.getRolesWithPermission(permission))
      .map(role => role.role_id)
      .includes(BigInt(role.id))
    if (!alreadyHasRole) {
      await interaction.reply({ embeds: [embedAlreadyDoesNotHavePermission(permission.toString(), role.id)], flags: MessageFlags.Ephemeral });
    }
    else {
      const res = await PermissionRoles.removePermissionFromRole(permission, BigInt(role.id))
      if (res === undefined) {
        await interaction.reply({ embeds: [embedFailure(permission.toString(), role.id)], flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ embeds: [embedSuccess(permission.toString(), role.id)], flags: MessageFlags.Ephemeral });
      }
    }
  },
} satisfies Command;

function embedSuccess(permission: string, roleId: string): EmbedBuilder {
  return successEmbed
    .setTitle("Permission removed from role")
    .setDescription(`<@&${roleId}> no longer has permission ${permission}`)
    .setFields([])
}

function embedFailure(permission: string, roleId: string): EmbedBuilder {
  return failureEmbed
    .setTitle("Error adding role")
    .setDescription(`<@&${roleId}> did not successfully have ${permission} removed`)
    .setFields([])
}

function embedAlreadyDoesNotHavePermission(permission: string, roleId: string): EmbedBuilder {
  return failureEmbed
    .setTitle("Role already does not have permission")
    .setDescription(`<@&${roleId}> already does not have permission ${permission}`)
    .setFields([])
}
