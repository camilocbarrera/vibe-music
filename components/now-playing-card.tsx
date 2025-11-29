"use client"

import type { Song } from "@/lib/queries"
import { Music2, Clock, User } from "lucide-react"
import { SourceBadge } from "@/components/source-badge"
import { cn } from "@/lib/utils"

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
    <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/30">
            <Music2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">{"Now Playing"}</span>
                <SourceBadge source={song.source} size="sm" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground truncate">{song.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{"Duration: "}</span>
              <span className="font-medium">{formatDuration(song.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{"Added by "}</span>
              <span className="font-medium">{song.addedBy}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

