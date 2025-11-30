"use client"

import { useState, useMemo, useEffect } from "react"
import { AddSongDialog } from "@/components/add-song-dialog"
import { QueueList } from "@/components/queue-list"
import { NowPlayingCard } from "@/components/now-playing-card"
import { Button } from "@/components/ui/button"
import { Plus, Github } from "lucide-react"
import { useSongs, useDeleteSong, useNowPlaying } from "@/lib/queries"
import { toast } from "sonner"

export default function Home() {
  const { data: queue = [], isLoading } = useSongs()
  const { data: nowPlaying } = useNowPlaying()
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
      <div className="mx-auto max-w-4xl px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl tracking-tight text-foreground">{"Vibe Playlist 🎵"}</h1>
              <a
                href="https://github.com/camilocbarrera/vibe-music"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="View on GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {"Drop bangers from YouTube & Spotify. Press "}
              <kbd className="px-1 py-0.5 text-xs font-semibold text-foreground bg-muted rounded border border-border">
                ⌘K
              </kbd>
              {" to add"}
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            {"Add Song"}
          </Button>
        </header>

        {queue.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{"Queue is empty 🎵"}</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="mt-3" size="sm">
                {"Add first song"}
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
