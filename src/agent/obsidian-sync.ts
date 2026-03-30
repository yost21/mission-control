import fs from "fs";
import path from "path";

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || "/home/ubuntu/obsidian-vault";
const INBOX_DIR = process.env.OBSIDIAN_INBOX_DIR || "Brain Dump";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function todayFilename(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}.md`;
}

function formatTimestamp(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export interface BrainDumpEntry {
  content: string;
  author: string;
  attachments?: { name: string; url: string }[];
}

/**
 * Appends a brain dump entry to today's daily note in the Obsidian vault.
 * Creates the file with a heading if it doesn't exist yet.
 */
export function appendToDailyNote(entry: BrainDumpEntry): string {
  const dir = path.join(VAULT_PATH, INBOX_DIR);
  ensureDir(dir);

  const filename = todayFilename();
  const filepath = path.join(dir, filename);
  const time = formatTimestamp();

  let block = `\n---\n**${time}** — _${entry.author}_\n\n${entry.content}\n`;

  if (entry.attachments && entry.attachments.length > 0) {
    for (const att of entry.attachments) {
      block += `\n- 📎 [${att.name}](${att.url})`;
    }
    block += "\n";
  }

  if (!fs.existsSync(filepath)) {
    const d = new Date();
    const header = `# Brain Dump — ${d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}\n`;
    fs.writeFileSync(filepath, header + block, "utf-8");
  } else {
    fs.appendFileSync(filepath, block, "utf-8");
  }

  return filepath;
}
