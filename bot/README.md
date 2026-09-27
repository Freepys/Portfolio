# Sticker Vault Invite Bot

Dieser Bot postet automatisch die neueste Sticker Vault Invite in einen Channel
und stellt den Slash-Command `/invite` bereit.

## Setup

1. Abhaengigkeiten installieren:
   - `cd bot`
   - `npm install`
2. `.env.example` nach `.env` kopieren und Werte setzen.
3. Slash-Command deployen:
   - `npm run deploy-commands`
4. Bot starten:
   - `npm start`

## Benoetigte Bot-Rechte

- `View Channels`
- `Send Messages`
- `Create Instant Invite` (falls der Bot selbst Invite-Links erstellen soll)
- `Manage Guild` oder Invite-Leserechte, damit `/guilds/{guild.id}/invites` funktioniert

## Hinweis

Der Bot liest alle Guild-Invites und nimmt die zeitlich neueste (`created_at`).
