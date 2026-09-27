import "dotenv/config";
import { ChannelType, Client, GatewayIntentBits, PermissionsBitField } from "discord.js";

const DISCORD_API_BASE = "https://discord.com/api/v10";
const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.STICKER_VAULT_GUILD_ID;
const channelId = process.env.STICKER_VAULT_CHANNEL_ID;
const intervalSeconds = Number(process.env.INVITE_CHECK_INTERVAL_SECONDS || 300);

if (!token || !guildId || !channelId) {
  throw new Error("Missing DISCORD_BOT_TOKEN, STICKER_VAULT_GUILD_ID or STICKER_VAULT_CHANNEL_ID.");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let lastPostedInviteCode = null;

function getLatestInvite(invites) {
  const validInvites = invites.filter((invite) => typeof invite.code === "string" && invite.code.length > 0);
  if (!validInvites.length) {
    return null;
  }

  return validInvites.sort((a, b) => {
    const aTime = a.created_at ? Date.parse(a.created_at) : 0;
    const bTime = b.created_at ? Date.parse(b.created_at) : 0;
    return bTime - aTime;
  })[0];
}

async function fetchLatestInviteCode() {
  const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/invites`, {
    headers: {
      Authorization: `Bot ${token}`
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Discord API error ${response.status}: ${details.slice(0, 500)}`);
  }

  const invites = await response.json();
  const latestInvite = getLatestInvite(Array.isArray(invites) ? invites : []);
  return latestInvite?.code || null;
}

async function ensurePermissions(channel) {
  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("Configured channel must be a text channel.");
  }

  const me = channel.guild.members.me;
  if (!me) {
    throw new Error("Bot member is not available in guild cache.");
  }

  const perms = channel.permissionsFor(me);
  if (!perms?.has(PermissionsBitField.Flags.SendMessages)) {
    throw new Error("Bot is missing Send Messages permission in target channel.");
  }
}

async function postLatestInviteIfChanged() {
  const channel = await client.channels.fetch(channelId);
  await ensurePermissions(channel);

  const latestCode = await fetchLatestInviteCode();
  if (!latestCode) {
    console.warn("No invite found in guild.");
    return;
  }

  if (lastPostedInviteCode === latestCode) {
    return;
  }

  await channel.send(`Neue Sticker Vault Invite: https://discord.gg/${latestCode}`);
  lastPostedInviteCode = latestCode;
  console.log(`Posted invite ${latestCode}`);
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await postLatestInviteIfChanged();
  } catch (error) {
    console.error("Initial invite post failed:", error);
  }

  setInterval(async () => {
    try {
      await postLatestInviteIfChanged();
    } catch (error) {
      console.error("Scheduled invite check failed:", error);
    }
  }, Math.max(intervalSeconds, 30) * 1000);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (interaction.commandName !== "invite") {
    return;
  }

  try {
    const latestCode = await fetchLatestInviteCode();
    if (!latestCode) {
      await interaction.reply({ content: "Ich konnte aktuell keine Invite finden.", ephemeral: true });
      return;
    }

    await interaction.reply(`Aktuelle Sticker Vault Invite: https://discord.gg/${latestCode}`);
  } catch (error) {
    await interaction.reply({
      content: `Fehler beim Laden der Invite: ${error instanceof Error ? error.message : String(error)}`,
      ephemeral: true
    });
  }
});

client.login(token);
