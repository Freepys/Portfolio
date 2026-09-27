import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.STICKER_VAULT_GUILD_ID;

if (!token || !clientId || !guildId) {
  throw new Error("Missing DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID or STICKER_VAULT_GUILD_ID.");
}

const commands = [
  new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Sendet die neueste Sticker Vault Invite.")
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(token);

await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
  body: commands
});

console.log("Slash command /invite deployed successfully.");
