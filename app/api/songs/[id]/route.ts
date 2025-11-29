import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { songs } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fingerprint = request.headers.get("x-fingerprint")

    if (!fingerprint) {
      return NextResponse.json({ error: "Fingerprint is required" }, { status: 400 })
    }

    const song = await db.query.songs.findFirst({
      where: eq(songs.id, id),
    })

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    if (song.addedByFingerprint !== fingerprint) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await db.delete(songs).where(eq(songs.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting song:", error)
    return NextResponse.json({ error: "Failed to delete song" }, { status: 500 })
  }
}

