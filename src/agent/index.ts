/**
 * Mission Control — Discord Agent Server
 *
 * Watches a Discord #brain-dump channel and syncs messages
 * to the Obsidian vault as daily markdown notes.
 *
 * Required env vars:
 *   DISCORD_BOT_TOKEN        — Bot token from Discord Developer Portal
 *   OBSIDIAN_VAULT_PATH      — Absolute path to Obsidian vault root
 *
 * Optional env vars:
 *   BRAIN_DUMP_CHANNEL_NAME  — Channel name to watch (default: "brain-dump")
 *   OBSIDIAN_INBOX_DIR       — Subfolder in vault for dumps (default: "Brain Dump")
 */

import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

import "./discord-bot";
