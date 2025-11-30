"use client"

import type { Song } from "@/lib/queries"
import { Music2, Clock, User, Play } from "lucide-react"
import { SourceBadge } from "@/components/source-badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

type NowPlayingCardProps = {
  song: Song | null
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "Unknown"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function NowPlayingCard({ song }: NowPlayingCardProps) {
  if (!song) {
    return null
  }

  return (
    <div className="mb-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
            <Music2 className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">{"Now Playing"}</span>
            <SourceBadge source={song.source} size="sm" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-foreground truncate">{song.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(song.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{song.addedBy}</span>
            </div>
            {/* <Link 
              href="/vibe-reproductor-player"
              className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Play className="h-3 w-3" />
              {"Open Player"}
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  )
}

