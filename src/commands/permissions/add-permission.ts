import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import type { Command } from '../index.js';
import { Permission, PermissionManager } from "../../permissions.js";
import { PermissionRoles } from "../../db/permission-roles.js";
import { permissionChoices } from "./permission-utils.js";
import { failureEmbed, successEmbed } from "../../lib/embeds.js";

export default {
  data: {
    name: "add-permission",
    description: "Give the target role the selected permission",
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
        description: "Permission to add",
        required: true,
        choices: permissionChoices()
      }
    ]
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const role = interaction.options.getRole("role")!
    const permission = interaction.options.getString("permission")! as unknown as Permission
    const alreadyHasRole = (await PermissionRoles.getRolesWithPermission(permission))
      .map(role => role.role_id)
      .includes(BigInt(role.id))
    if (alreadyHasRole) {
      await interaction.reply({ embeds: [embedAlreadyHasPermission(permission.toString(), role.id)], ephemeral: true });
    }
    else {
      const res = await PermissionRoles.addPermissionToRole(permission, BigInt(role.id))
      if (res === undefined) {
        await interaction.reply({ embeds: [embedFailure(permission.toString(), role.id)], ephemeral: true });
        interaction.reply(`Error giving <@&${role.id}> permission ${permission}`)
      } else {
        await interaction.reply({ embeds: [embedSuccess(permission.toString(), role.id)], ephemeral: true });
      }
    }
  },
} satisfies Command;

function embedSuccess(permission: string, roleId: string): EmbedBuilder {
  return successEmbed
    .setTitle("Permission added to role")
    .setDescription(`<@&${roleId}> now has permission ${permission}`)
}

function embedFailure(permission: string, roleId: string): EmbedBuilder {
  return failureEmbed
    .setTitle("Error adding role")
    .setDescription(`<@&${roleId}> was not successfully given permission ${permission}`)
}


function embedAlreadyHasPermission(permission: string, roleId: string): EmbedBuilder {
  return failureEmbed
    .setTitle("Role already has permission")
    .setDescription(`<@&${roleId}> already has permission ${permission}`)
}
