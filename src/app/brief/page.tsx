"use client";

import { useEffect, useState, useCallback } from "react";

interface NoteEntry {
  slug: string;
  title: string;
  folder: string;
  modified: string;
}

interface VaultIndex {
  notes: NoteEntry[];
  lastSync: string | null;
  vaultPath: string;
  connected: boolean;
}

interface VaultNote {
  slug: string;
  title: string;
  content: string;
  modified: string;
  folder: string;
}

export default function BriefPage() {
  const [index, setIndex] = useState<VaultIndex | null>(null);
  const [note, setNote] = useState<VaultNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchIndex = useCallback(async () => {
    try {
      const res = await fetch("/api/vault");
      const data = await res.json();
      setIndex(data);
      setError(null);
    } catch {
      setError("Failed to load vault");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndex();
  }, [fetchIndex]);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/vault", { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message);
      } else {
        setError(null);
        await fetchIndex();
      }
    } catch {
      setError("Sync request failed");
    } finally {
      setSyncing(false);
    }
  }

  async function openNote(slug: string) {
    try {
      const res = await fetch(`/api/vault?note=${encodeURIComponent(slug)}`);
      if (!res.ok) {
        setError("Note not found");
        return;
      }
      const data = await res.json();
      setNote(data);
      setError(null);
    } catch {
      setError("Failed to load note");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-slate-400 animate-pulse">Loading vault...</div>
      </div>
    );
  }

  // Not connected — show setup instructions
  if (index && !index.connected) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <h1 className="text-2xl font-semibold text-slate-200 mb-4">Obsidian Vault</h1>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
          <p className="text-slate-300">
            No vault found at <code className="text-amber-400 bg-slate-800 px-1.5 py-0.5 rounded text-sm">{index.vaultPath}</code>
          </p>
          <div className="space-y-2 text-sm text-slate-400">
            <p className="font-medium text-slate-300">To connect your Obsidian vault:</p>
            <ol className="list-decimal list-inside space-y-1.5 ml-1">
              <li>Push your vault to a git repo from your MacBook</li>
              <li>Clone it on this server, or set the env vars:</li>
            </ol>
            <pre className="bg-slate-900 rounded p-3 mt-2 text-slate-300 overflow-x-auto">{`# Option A: Clone manually
git clone <your-vault-repo> ~/obsidian-vault

# Option B: Set env vars and let Mission Control clone it
OBSIDIAN_VAULT_REPO=git@github.com:you/vault.git
OBSIDIAN_VAULT_PATH=~/obsidian-vault`}</pre>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-md text-sm font-medium transition-colors"
          >
            {syncing ? "Syncing..." : "Try Sync"}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  // Viewing a single note
  if (note) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setNote(null)}
          className="mb-4 text-sm text-slate-400 hover:text-white transition-colors"
        >
          &larr; Back to vault
        </button>
        <article className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-100">{note.title}</h1>
              {note.folder && (
                <span className="text-xs text-slate-500 mt-1 block">{note.folder}</span>
              )}
            </div>
            <time className="text-xs text-slate-500 shrink-0">
              {new Date(note.modified).toLocaleDateString()}
            </time>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-slate-300 text-sm font-sans leading-relaxed">
              {note.content}
            </pre>
          </div>
        </article>
      </div>
    );
  }

  // Vault index view
  const folders = new Set(index?.notes.map((n) => n.folder) || []);
  const filtered = index?.notes.filter(
    (n) =>
      n.title.toLowerCase().includes(filter.toLowerCase()) ||
      n.folder.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-200">Obsidian Vault</h1>
          <p className="text-sm text-slate-500 mt-1">
            {index?.notes.length || 0} notes in {folders.size} folder{folders.size !== 1 ? "s" : ""}
            {index?.lastSync && (
              <> &middot; Last sync: {new Date(index.lastSync).toLocaleDateString()}</>
            )}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-md text-sm font-medium transition-colors"
        >
          {syncing ? "Syncing..." : "Sync"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-300">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Filter notes..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full mb-4 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
      />

      <div className="space-y-1">
        {filtered.map((n) => (
          <button
            key={n.slug}
            onClick={() => openNote(n.slug)}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                  {n.title}
                </span>
                {n.folder && (
                  <span className="ml-2 text-xs text-slate-600">{n.folder}</span>
                )}
              </div>
              <time className="text-xs text-slate-600 shrink-0 ml-4">
                {new Date(n.modified).toLocaleDateString()}
              </time>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-8 text-sm">
            {filter ? "No matching notes" : "No notes in vault"}
          </p>
        )}
      </div>
    </div>
  );
}
