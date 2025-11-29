import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { songs, userFingerprints } from "@/db/schema"
import { nanoid } from "nanoid"
import { getFunnyNameForFingerprint } from "@/lib/funny-names"
import { eq, desc, and, gte } from "drizzle-orm"

const RATE_LIMIT_MINUTES = 5
const MAX_SONGS_PER_WINDOW = 2

async function checkRateLimit(fingerprint: string): Promise<{ allowed: boolean; message?: string }> {
  const user = await db.query.userFingerprints.findFirst({
    where: eq(userFingerprints.fingerprint, fingerprint),
  })

  if (!user) {
    return { allowed: true }
  }

  if (!user.lastSongAddedAt) {
    return { allowed: true }
  }

  const now = new Date()
  const lastAdded = new Date(user.lastSongAddedAt)
  const minutesSinceLastAdd = (now.getTime() - lastAdded.getTime()) / (1000 * 60)

  if (minutesSinceLastAdd < RATE_LIMIT_MINUTES) {
    const recentSongs = await db.query.songs.findMany({
      where: and(
        eq(songs.addedByFingerprint, fingerprint),
        gte(songs.createdAt, new Date(now.getTime() - RATE_LIMIT_MINUTES * 60 * 1000))
      ),
    })

    if (recentSongs.length >= MAX_SONGS_PER_WINDOW) {
      const waitTime = Math.ceil(RATE_LIMIT_MINUTES - minutesSinceLastAdd)
      return {
        allowed: false,
        message: `Rate limit exceeded. Please wait ${waitTime} minute${waitTime > 1 ? "s" : ""} before adding more songs.`,
      }
    }
  }

  return { allowed: true }
}

export async function GET() {
  try {
    const allSongs = await db.query.songs.findMany({
      orderBy: [desc(songs.createdAt)],
    })

    return NextResponse.json(allSongs)
  } catch (error) {
    console.error("Error fetching songs:", error)
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, artist, source, url, thumbnail, duration, fingerprint } = body

    if (!fingerprint) {
      return NextResponse.json({ error: "Fingerprint is required" }, { status: 400 })
    }

    const rateLimitCheck = await checkRateLimit(fingerprint)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 })
    }

    let user = await db.query.userFingerprints.findFirst({
      where: eq(userFingerprints.fingerprint, fingerprint),
    })

    if (!user) {
      const displayName = getFunnyNameForFingerprint(fingerprint)
      await db.insert(userFingerprints).values({
        fingerprint,
        displayName,
      })
      user = await db.query.userFingerprints.findFirst({
        where: eq(userFingerprints.fingerprint, fingerprint),
      })
    }

    const songId = nanoid()
    const newSong = await db
      .insert(songs)
      .values({
        id: songId,
        title,
        artist,
        source,
        url,
        thumbnail,
        duration,
        addedBy: user!.displayName,
        addedByFingerprint: fingerprint,
      })
      .returning()

    await db
      .update(userFingerprints)
      .set({ lastSongAddedAt: new Date() })
      .where(eq(userFingerprints.fingerprint, fingerprint))

    return NextResponse.json(newSong[0], { status: 201 })
  } catch (error) {
    console.error("Error adding song:", error)
    return NextResponse.json({ error: "Failed to add song" }, { status: 500 })
  }
}

