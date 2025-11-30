"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAddSong } from "@/lib/queries"
import { toast } from "sonner"

type AddSongDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const isValidYouTubeUrl = (url: string): boolean => {
  const youtubePatterns = [
    /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|music\.youtube\.com\/watch\?v=)/,
    /^https?:\/\/youtube\.com\/embed\//,
    /^https?:\/\/youtube\.com\/v\//,
  ]
  return youtubePatterns.some((pattern) => pattern.test(url))
}

const isValidSpotifyUrl = (url: string): boolean => {
  return /^https?:\/\/(open\.)?spotify\.com\/track\/[a-zA-Z0-9]+/.test(url)
}

const isValidUrl = (url: string): boolean => {
  return isValidYouTubeUrl(url) || isValidSpotifyUrl(url)
}

export function AddSongDialog({ open, onOpenChange }: AddSongDialogProps) {
  const addSong = useAddSong()
  const [url, setUrl] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)

  const extractMetadataFromUrl = async (url: string) => {
    setIsExtracting(true)

    try {
      let videoId = ""
      let source: "youtube-music" | "youtube-video" | "spotify" = "youtube-video"
      let title = "Unknown Title"
      let artist = "Unknown Artist"

      if (url.includes("music.youtube.com")) {
        source = "youtube-music"
        const match = url.match(/[?&]v=([^&]+)/)
        videoId = match ? match[1] : ""
      } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
        source = "youtube-video"
        if (url.includes("youtu.be/")) {
          const match = url.match(/youtu\.be\/([^?]+)/)
          videoId = match ? match[1] : ""
        } else {
          const match = url.match(/[?&]v=([^&]+)/)
          videoId = match ? match[1] : ""
        }
      } else if (url.includes("spotify.com/track/")) {
        source = "spotify"
        const match = url.match(/track\/([^?]+)/)
        videoId = match ? match[1] : ""
      }

      if ((source === "youtube-music" || source === "youtube-video") && videoId) {
        try {
          const response = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
          )
          if (response.ok) {
            const data = await response.json()
            const fullTitle = data.title || "Unknown Title"
            if (fullTitle.includes(" - ")) {
              const [extractedArtist, ...titleParts] = fullTitle.split(" - ")
              artist = extractedArtist.trim()
              title = titleParts.join(" - ").trim()
            } else {
              title = fullTitle
            }
          }
        } catch (error) {
          console.log("Failed to fetch YouTube metadata:", error)
        }
      }

      return { source, title, artist }
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!url) {
      setUrlError("Please enter a URL")
      return
    }

    if (!isValidUrl(url)) {
      setUrlError("Please enter a valid YouTube or Spotify URL")
      return
    }

    setUrlError(null)
    const metadata = await extractMetadataFromUrl(url)
    if (!metadata) return

    addSong.mutate(
      {
        title: metadata.title,
        artist: metadata.artist,
        url,
        source: metadata.source,
        thumbnail: `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(`${metadata.artist} ${metadata.title}`)}`,
        duration: Math.floor(Math.random() * 300) + 120,
      },
      {
        onSuccess: () => {
          setUrl("")
          setUrlError(null)
          onOpenChange(false)
          toast.success("Banger added! 🎵")
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to add song")
        },
      }
    )
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) {
          setUrl("")
          setUrlError(null)
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{"Drop a Banger 🎧"}</DialogTitle>
          <DialogDescription>
            {"Just paste the URL and hit Enter. We'll grab everything automatically."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">{"Paste URL"}</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (urlError) {
                  setUrlError(null)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && url) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder="Paste YouTube or Spotify URL and press Enter"
              autoFocus
              required
              className={urlError ? "border-destructive" : ""}
            />
            {urlError && (
              <p className="text-xs text-destructive">{urlError}</p>
            )}
            {isExtracting && !urlError && (
              <p className="text-xs text-muted-foreground">{"Extracting metadata..."}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {"Cancel"}
            </Button>
            <Button type="submit" disabled={!url || isExtracting || addSong.isPending}>
              {isExtracting || addSong.isPending ? "Adding..." : "Drop It 🎵"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
