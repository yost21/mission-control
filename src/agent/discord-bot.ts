import {
  Client,
  GatewayIntentBits,
  Partials,
  Message,
  TextChannel,
} from "discord.js";
import { appendToDailyNote, BrainDumpEntry } from "./obsidian-sync";

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const BRAIN_DUMP_CHANNEL = process.env.BRAIN_DUMP_CHANNEL_NAME || "brain-dump";

if (!DISCORD_TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN is required. Set it in your environment.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.once("ready", () => {
  console.log(`✅ Discord bot online as ${client.user?.tag}`);
  console.log(`👂 Watching channel: #${BRAIN_DUMP_CHANNEL}`);
});

client.on("messageCreate", async (message: Message) => {
  // Ignore bots and system messages
  if (message.author.bot) return;

  // Only process messages from the brain-dump channel
  const channel = message.channel as TextChannel;
  if (channel.name !== BRAIN_DUMP_CHANNEL) return;

  const entry: BrainDumpEntry = {
    content: message.content,
    author: message.author.displayName || message.author.username,
    attachments: message.attachments.map((a) => ({
      name: a.name || "attachment",
      url: a.url,
    })),
  };

  // Skip empty messages with no attachments
  if (!entry.content && (!entry.attachments || entry.attachments.length === 0)) {
    return;
  }

  try {
    const filepath = appendToDailyNote(entry);
    await message.react("✅");
    console.log(`📝 Synced to ${filepath}`);
  } catch (err) {
    console.error("Failed to sync brain dump:", err);
    await message.react("❌").catch(() => {});
  }
});

client.login(DISCORD_TOKEN);
