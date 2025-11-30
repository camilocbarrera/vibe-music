"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { MusicPlayer } from "@/components/music-player"
import { QueueList } from "@/components/queue-list"
import { Button } from "@/components/ui/button"
import { ListMusic } from "lucide-react"
import { useSongs, useDeleteSong, useSetNowPlaying } from "@/lib/queries"
import { toast } from "sonner"

export default function VibeReproductorPlayer() {
  const { data: queue = [], isLoading } = useSongs()
  const deleteSong = useDeleteSong()
  const setNowPlaying = useSetNowPlaying()
  const [currentSongIndex, setCurrentSongIndex] = useState(0)

  const sortedQueue = useMemo(() => {
    return [...queue].reverse()
  }, [queue])

  useEffect(() => {
    if (sortedQueue.length > 0) {
      if (currentSongIndex >= sortedQueue.length) {
        setCurrentSongIndex(sortedQueue.length - 1)
      } else if (currentSongIndex < 0) {
        setCurrentSongIndex(0)
      }
    }
  }, [sortedQueue.length, currentSongIndex])

  useEffect(() => {
    const currentSong = sortedQueue[currentSongIndex]
    if (currentSong) {
      setNowPlaying.mutate(currentSong.id)
    }
  }, [currentSongIndex])

  const handleNext = () => {
    if (currentSongIndex < sortedQueue.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1)
    }
  }

  const handleSelectSong = (index: number) => {
    setCurrentSongIndex(index)
  }

  const handleRemove = (id: string) => {
    const removedIndex = sortedQueue.findIndex((song) => song.id === id)
    const isCurrentSong = removedIndex === currentSongIndex

    deleteSong.mutate(id, {
      onSuccess: () => {
        const newQueue = sortedQueue.filter((song) => song.id !== id)
        if (isCurrentSong) {
          if (newQueue.length > 0) {
            if (removedIndex < newQueue.length) {
              setCurrentSongIndex(removedIndex)
            } else {
              setCurrentSongIndex(newQueue.length - 1)
            }
          } else {
            setCurrentSongIndex(0)
          }
        } else if (removedIndex < currentSongIndex) {
          setCurrentSongIndex(currentSongIndex - 1)
        }
        toast.success("Song removed from queue")
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to remove song")
      },
    })
  }

  const currentSong = sortedQueue[currentSongIndex]

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading playlist...</p>
      </main>
    )
  }

  if (!currentSong) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl tracking-tight text-foreground mb-4">{"Vibe Reproductor 🎵"}</h1>
          <p className="text-lg text-muted-foreground">{"No songs in queue. Add songs from the main playlist."}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ListMusic className="h-4 w-4" />
                {"Back to Playlist"}
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="font-serif text-3xl tracking-tight text-foreground">{"Vibe Reproductor 🎵"}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {"Now playing: "}
              {currentSongIndex + 1}
              {" of "}
              {sortedQueue.length}
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
          <div>
            <MusicPlayer
              song={currentSong}
              onNext={handleNext}
              onPrevious={handlePrevious}
              hasNext={currentSongIndex < sortedQueue.length - 1}
              hasPrevious={currentSongIndex > 0}
            />
          </div>

          <QueueList
            queue={sortedQueue}
            currentSongIndex={currentSongIndex}
            onSelectSong={handleSelectSong}
            onRemoveSong={handleRemove}
          />
        </div>
      </div>
    </main>
  )
}

