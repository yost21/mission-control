import { NextRequest, NextResponse } from "next/server";
import { getVaultIndex, getNote, syncVault } from "../../lib/vault";

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

export async function POST() {
  const result = await syncVault();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
