"use client"

import type { Song } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Play, Music2, User } from "lucide-react"
import { SourceBadge } from "@/components/source-badge"
import { cn } from "@/lib/utils"
import { getOrCreateFingerprint } from "@/lib/fingerprint"

type QueueListProps = {
  queue: Song[]
  currentSongIndex: number
  onSelectSong: (index: number) => void
  onRemoveSong: (id: string) => void
  readOnly?: boolean
}

export function QueueList({ queue, currentSongIndex, onSelectSong, onRemoveSong, readOnly = false }: QueueListProps) {
  const fingerprint = getOrCreateFingerprint()
  const isSelectable = !readOnly && currentSongIndex >= 0
  
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 font-serif text-lg tracking-tight">{"Queue"}</h3>
      <ScrollArea className="h-[500px]">
        <div className="space-y-1.5">
          {queue.map((song, index) => (
            <div
              key={song.id}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg border p-2.5 transition-all",
                currentSongIndex === index ? "border-primary bg-accent" : "border-transparent",
                isSelectable ? "hover:bg-accent cursor-pointer" : "cursor-default"
              )}
            >
              <div
                onClick={() => isSelectable && onSelectSong(index)}
                className={cn(
                  "flex flex-1 items-center gap-2.5 text-left",
                  !isSelectable && "pointer-events-none"
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border transition-colors">
                    <Music2 className="h-5 w-5 text-primary" />
                  </div>
                  {isSelectable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 rounded">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{song.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                    <span className="text-muted-foreground/50">•</span>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground/70" />
                      <p className="text-xs text-muted-foreground">{song.addedBy}</p>
                    </div>
                  </div>
                </div>
                <SourceBadge source={song.source} size="sm" />
              </div>
              {song.addedByFingerprint === fingerprint && (
                <Button
                  onClick={() => onRemoveSong(song.id)}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
