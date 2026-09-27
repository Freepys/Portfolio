const DISCORD_API_BASE = "https://discord.com/api/v10";

function json(res, statusCode, payload) {
  res.status(statusCode).setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

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

export default async function handler(req, res) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.STICKER_VAULT_GUILD_ID;
  const fallbackInvite = process.env.STICKER_VAULT_FALLBACK_INVITE;

  if (!token || !guildId) {
    return json(res, 500, {
      error: "Missing DISCORD_BOT_TOKEN or STICKER_VAULT_GUILD_ID environment variable."
    });
  }

  try {
    const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/invites`, {
      headers: {
        Authorization: `Bot ${token}`
      }
    });

    if (!response.ok) {
      const body = await response.text();
      return json(res, 502, {
        error: "Discord API returned an error while fetching invites.",
        status: response.status,
        details: body.slice(0, 500)
      });
    }

    const invites = await response.json();
    const latestInvite = getLatestInvite(Array.isArray(invites) ? invites : []);
    const inviteCode = latestInvite?.code;

    if (!inviteCode) {
      if (fallbackInvite) {
        return res.redirect(307, fallbackInvite);
      }

      return json(res, 404, {
        error: "No invite found for Sticker Vault."
      });
    }

    return res.redirect(307, `https://discord.gg/${inviteCode}`);
  } catch (error) {
    return json(res, 500, {
      error: "Unexpected error while resolving Sticker Vault invite.",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
