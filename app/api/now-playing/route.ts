import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { appState, songs } from "@/db/schema"
import { eq } from "drizzle-orm"

const NOW_PLAYING_KEY = "current_playing_song_id"

export async function GET() {
  try {
    const state = await db.query.appState.findFirst({
      where: eq(appState.key, NOW_PLAYING_KEY),
    })

    if (!state || !state.value) {
      return NextResponse.json({ currentSong: null })
    }

    const currentSong = await db.query.songs.findFirst({
      where: eq(songs.id, state.value),
    })

    return NextResponse.json({ currentSong: currentSong || null })
  } catch (error) {
    console.error("Error fetching now playing:", error)
    return NextResponse.json({ currentSong: null })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { songId } = body

    if (!songId) {
      return NextResponse.json({ error: "Song ID is required" }, { status: 400 })
    }

    const song = await db.query.songs.findFirst({
      where: eq(songs.id, songId),
    })

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    const existingState = await db.query.appState.findFirst({
      where: eq(appState.key, NOW_PLAYING_KEY),
    })

    if (existingState) {
      await db
        .update(appState)
        .set({ value: songId, updatedAt: new Date() })
        .where(eq(appState.key, NOW_PLAYING_KEY))
    } else {
      await db.insert(appState).values({
        key: NOW_PLAYING_KEY,
        value: songId,
      })
    }

    return NextResponse.json({ success: true, currentSong: song })
  } catch (error) {
    console.error("Error updating now playing:", error)
    return NextResponse.json({ error: "Failed to update now playing" }, { status: 500 })
  }
}
