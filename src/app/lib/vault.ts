import { exec as execCb } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const exec = promisify(execCb);

// Default vault path — override with OBSIDIAN_VAULT_PATH env var
const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || path.join(process.env.HOME || "/home/user", "obsidian-vault");
const VAULT_REPO = process.env.OBSIDIAN_VAULT_REPO || ""; // e.g. git@github.com:user/vault.git

export interface VaultNote {
  slug: string;
  title: string;
  content: string;
  modified: string;
  folder: string;
}

export interface VaultIndex {
  notes: Array<{ slug: string; title: string; folder: string; modified: string }>;
  lastSync: string | null;
  vaultPath: string;
  connected: boolean;
}

/**
 * Pull latest vault changes from git. If the vault doesn't exist yet and
 * OBSIDIAN_VAULT_REPO is set, clone it.
 */
export async function syncVault(): Promise<{ ok: boolean; message: string }> {
  try {
    const exists = await fs.access(VAULT_PATH).then(() => true).catch(() => false);

    if (!exists && VAULT_REPO) {
      await exec(`git clone ${VAULT_REPO} ${VAULT_PATH}`, { timeout: 30_000 });
      return { ok: true, message: "Vault cloned successfully" };
    }

    if (!exists) {
      return { ok: false, message: `Vault not found at ${VAULT_PATH}. Set OBSIDIAN_VAULT_PATH or OBSIDIAN_VAULT_REPO.` };
    }

    // Check if it's a git repo
    const isGit = await fs.access(path.join(VAULT_PATH, ".git")).then(() => true).catch(() => false);
    if (isGit) {
      const { stdout } = await exec("git pull --ff-only 2>&1", { cwd: VAULT_PATH, timeout: 15_000 });
      return { ok: true, message: stdout.trim() || "Already up to date" };
    }

    return { ok: true, message: "Vault found (not a git repo — using local files)" };
  } catch (e: unknown) {
    const err = e as Error;
    return { ok: false, message: err.message || "Sync failed" };
  }
}

/**
 * Recursively list all .md files in the vault, excluding dotfiles and
 * Obsidian config directories.
 */
async function walkMarkdown(dir: string, base: string = dir): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (entry.name === "node_modules") continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkMarkdown(full, base));
    } else if (entry.name.endsWith(".md")) {
      files.push(path.relative(base, full));
    }
  }

  return files;
}

/**
 * Build an index of all notes in the vault.
 */
export async function getVaultIndex(): Promise<VaultIndex> {
  const exists = await fs.access(VAULT_PATH).then(() => true).catch(() => false);
  if (!exists) {
    return { notes: [], lastSync: null, vaultPath: VAULT_PATH, connected: false };
  }

  const mdFiles = await walkMarkdown(VAULT_PATH);
  const notes = await Promise.all(
    mdFiles.map(async (relPath) => {
      const full = path.join(VAULT_PATH, relPath);
      const stat = await fs.stat(full);
      const slug = relPath.replace(/\.md$/, "");
      const title = path.basename(slug);
      const folder = path.dirname(relPath) === "." ? "" : path.dirname(relPath);
      return { slug, title, folder, modified: stat.mtime.toISOString() };
    })
  );

  // Sort by modified date descending
  notes.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());

  // Check last git sync time
  let lastSync: string | null = null;
  try {
    const { stdout } = await exec("git log -1 --format=%cI", { cwd: VAULT_PATH, timeout: 5000 });
    lastSync = stdout.trim() || null;
  } catch {
    // not a git repo or no commits
  }

  return { notes, lastSync, vaultPath: VAULT_PATH, connected: true };
}

/**
 * Read a single note by its slug (relative path without .md).
 */
export async function getNote(slug: string): Promise<VaultNote | null> {
  // Prevent path traversal
  const normalized = path.normalize(slug).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(VAULT_PATH, normalized + ".md");

  // Ensure the resolved path is within the vault
  if (!filePath.startsWith(VAULT_PATH)) return null;

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const stat = await fs.stat(filePath);
    const title = path.basename(normalized);
    const folder = path.dirname(normalized) === "." ? "" : path.dirname(normalized);
    return { slug: normalized, title, content, modified: stat.mtime.toISOString(), folder };
  } catch {
    return null;
  }
}
