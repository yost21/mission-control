import { NextRequest, NextResponse } from "next/server";
import { getVaultIndex, getNote, syncVault, writeNote, pushVault, writeStatusSnapshot } from "../../lib/vault";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("note");

  // If a specific note is requested, return its content
  if (slug) {
    const note = await getNote(slug);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json(note);
  }

  // Otherwise return the vault index
  const index = await getVaultIndex();
  return NextResponse.json(index);
}

export async function POST(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");

  // POST /api/vault?action=push — push vault to remote
  if (action === "push") {
    const result = await pushVault();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  }

  // POST /api/vault?action=snapshot — generate a server status note
  if (action === "snapshot") {
    const note = await writeStatusSnapshot();
    if (!note) {
      return NextResponse.json({ error: "Failed to write snapshot" }, { status: 500 });
    }
    return NextResponse.json(note);
  }

  // Default POST — sync (git pull)
  const result = await syncVault();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { slug, content } = body as { slug?: string; content?: string };

  if (!slug || typeof content !== "string") {
    return NextResponse.json({ error: "slug and content are required" }, { status: 400 });
  }

  const note = await writeNote(slug, content);
  if (!note) {
    return NextResponse.json({ error: "Failed to write note" }, { status: 500 });
  }

  return NextResponse.json(note);
}
