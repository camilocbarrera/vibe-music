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
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-serif text-xl tracking-tight">{"Queue"}</h3>
      <ScrollArea className="h-[600px]">
        <div className="space-y-2">
          {queue.map((song, index) => (
            <div
              key={song.id}
              className={cn(
                "group flex items-center gap-3 rounded-lg border p-3 transition-all",
                currentSongIndex === index ? "border-primary bg-accent" : "border-transparent",
                isSelectable ? "hover:bg-accent cursor-pointer" : "cursor-default"
              )}
            >
              <div
                onClick={() => isSelectable && onSelectSong(index)}
                className={cn(
                  "flex flex-1 items-center gap-3 text-left",
                  !isSelectable && "pointer-events-none"
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className="h-12 w-12 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border transition-colors">
                    <Music2 className="h-6 w-6 text-primary" />
                  </div>
                  {isSelectable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 rounded">
                      <Play className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{song.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">{song.addedBy}</span>
                      {" added this"}
                    </p>
                  </div>
                </div>
                <SourceBadge source={song.source} size="sm" />
              </div>
              {song.addedByFingerprint === fingerprint && (
                <Button
                  onClick={() => onRemoveSong(song.id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
