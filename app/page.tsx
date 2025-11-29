"use client"

import { useState, useMemo, useEffect } from "react"
import { AddSongDialog } from "@/components/add-song-dialog"
import { QueueList } from "@/components/queue-list"
import { NowPlayingCard } from "@/components/now-playing-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useSongs, useDeleteSong } from "@/lib/queries"
import { toast } from "sonner"

export default function Home() {
  const { data: queue = [], isLoading } = useSongs()
  const deleteSong = useDeleteSong()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsAddDialogOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const sortedQueue = useMemo(() => {
    return [...queue].reverse()
  }, [queue])

  const nowPlaying = sortedQueue.length > 0 ? sortedQueue[0] : null

  const handleRemove = (id: string) => {
    deleteSong.mutate(id, {
      onSuccess: () => {
        toast.success("Song removed from queue")
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to remove song")
      },
    })
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex h-96 items-center justify-center">
            <p className="text-muted-foreground">Loading songs...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl tracking-tight text-foreground">{"Vibe Playlist 🎵"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {"Drop bangers from YouTube & Spotify. No signup, just vibes. "}
              <span className="text-xs text-muted-foreground/70">
                {"(Press "}
                <kbd className="px-1.5 py-0.5 text-xs font-semibold text-foreground bg-muted rounded border border-border">
                  ⌘K
                </kbd>
                {" or "}
                <kbd className="px-1.5 py-0.5 text-xs font-semibold text-foreground bg-muted rounded border border-border">
                  Ctrl+K
                </kbd>
                {" to add)"}
              </span>
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            {"Drop a Banger"}
          </Button>
        </header>

        {queue.length === 0 ? (
          <div className="flex h-96 items-center justify-center rounded-2xl border border-border bg-card">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">{"Queue is empty. Time to fix that 🎵"}</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                {"Drop the first banger"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {nowPlaying && <NowPlayingCard song={nowPlaying} />}
            <QueueList
              queue={sortedQueue}
              currentSongIndex={-1}
              onSelectSong={() => {}}
              onRemoveSong={handleRemove}
              readOnly={true}
            />
          </>
        )}
      </div>

      <AddSongDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </main>
  )
}
