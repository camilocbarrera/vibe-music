"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import type { Song } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { SourceBadge } from "@/components/source-badge"

type MusicPlayerProps = {
  song: Song
  onNext: () => void
  onPrevious: () => void
  hasNext: boolean
  hasPrevious: boolean
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function MusicPlayer({ song, onNext, onPrevious, hasNext, hasPrevious }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [isYTReady, setIsYTReady] = useState(false)
  const isInitializedRef = useRef(false)
  const currentVideoIdRef = useRef<string | null>(null)
  const previousVideoIdForCleanupRef = useRef<string | null>(null)

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        setIsYTReady(true)
      }
    } else {
      setIsYTReady(true)
    }
  }, [])

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const getSpotifyTrackId = (url: string) => {
    const match = url.match(/track\/([a-zA-Z0-9]+)/)
    return match ? match[1] : null
  }

  const videoId = useMemo(() => {
    if (song.source !== "youtube-music" && song.source !== "youtube-video") return null
    return getYouTubeVideoId(song.url)
  }, [song.source, song.url])

  const hasNextRef = useRef(hasNext)
  const onNextRef = useRef(onNext)
  
  useEffect(() => {
    hasNextRef.current = hasNext
    onNextRef.current = onNext
  }, [hasNext, onNext])

  useEffect(() => {
    if (!isYTReady || !playerContainerRef.current) return
    if (!videoId) return

    const previousVideoId = previousVideoIdForCleanupRef.current
    
    if (playerRef.current && isInitializedRef.current) {
      if (currentVideoIdRef.current === videoId) {
        return
      }
      try {
        currentVideoIdRef.current = videoId
        previousVideoIdForCleanupRef.current = videoId
        playerRef.current.loadVideoById(videoId)
        setIsPlaying(false)
        setCurrentTime(0)
        setTimeout(() => {
          if (playerRef.current && playerRef.current.playVideo) {
            playerRef.current.playVideo()
          }
        }, 500)
      } catch (error) {
        console.error("[v0] Error loading video:", error)
      }
    } else {
      if (playerContainerRef.current) {
        playerContainerRef.current.innerHTML = ""
        const playerDiv = document.createElement("div")
        playerDiv.id = "youtube-player"
        playerContainerRef.current.appendChild(playerDiv)

        try {
          playerRef.current = new window.YT.Player("youtube-player", {
            height: "100%",
            width: "100%",
            videoId: videoId,
            playerVars: {
              autoplay: 1,
              controls: 0,
              modestbranding: 1,
            },
            events: {
              onReady: () => {
                isInitializedRef.current = true
                currentVideoIdRef.current = videoId
                previousVideoIdForCleanupRef.current = videoId
                if (playerRef.current && playerRef.current.playVideo) {
                  playerRef.current.playVideo()
                }
              },
              onStateChange: (event: any) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true)
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  setIsPlaying(false)
                } else if (event.data === window.YT.PlayerState.ENDED) {
                  setIsPlaying(false)
                  if (hasNextRef.current) {
                    setTimeout(() => {
                      onNextRef.current()
                    }, 500)
                  }
                }
              },
            },
          })
        } catch (error) {
          console.error("[v0] Error creating YouTube player:", error)
        }
      }
    }

    return () => {
      if (previousVideoId !== videoId && previousVideoId !== null && playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy()
          playerRef.current = null
          isInitializedRef.current = false
          currentVideoIdRef.current = null
        } catch (error) {
          console.error("[v0] Error destroying player:", error)
        }
      }
    }
  }, [videoId, isYTReady])

  useEffect(() => {
    if (!playerRef.current || song.source === "spotify") return

    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        try {
          const time = playerRef.current.getCurrentTime()
          setCurrentTime(time)
        } catch (error) {
          // Silently handle errors when player is transitioning
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [song.id, song.source])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayPause = () => {
    if (song.source === "youtube-music" || song.source === "youtube-video") {
      if (playerRef.current && playerRef.current.getPlayerState) {
        try {
          if (isPlaying) {
            playerRef.current.pauseVideo()
          } else {
            playerRef.current.playVideo()
          }
        } catch (error) {
          console.error("[v0] Error toggling playback:", error)
        }
      }
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (value: number[]) => {
    if (playerRef.current && playerRef.current.seekTo) {
      try {
        playerRef.current.seekTo(value[0], true)
      } catch (error) {
        console.error("[v0] Error seeking:", error)
      }
    }
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(false)
    if (playerRef.current && playerRef.current.setVolume) {
      try {
        playerRef.current.setVolume(value[0])
      } catch (error) {
        console.error("[v0] Error changing volume:", error)
      }
    }
  }

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    if (playerRef.current) {
      try {
        if (newMuted) {
          playerRef.current.mute()
        } else {
          playerRef.current.unMute()
        }
      } catch (error) {
        console.error("[v0] Error toggling mute:", error)
      }
    }
  }

  const getDuration = () => {
    if (playerRef.current && playerRef.current.getDuration) {
      try {
        return playerRef.current.getDuration()
      } catch (error) {
        return song.duration || 300
      }
    }
    return song.duration || 300
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="relative aspect-video bg-gradient-to-br from-accent via-card to-muted">
        {song.source === "spotify" ? (
          <iframe
            src={`https://open.spotify.com/embed/track/${getSpotifyTrackId(song.url)}?utm_source=generator`}
            width="100%"
            height="100%"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="border-0"
          />
        ) : (
          <>
            <div ref={playerContainerRef} className="h-full w-full" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm pointer-events-none">
              <Button
                onClick={handlePlayPause}
                size="icon"
                className="h-16 w-16 rounded-full pointer-events-auto"
                variant="default"
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="font-serif text-xl tracking-tight text-foreground">{song.title}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{song.artist}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {"Added by "}
              {song.addedBy}
            </p>
          </div>
          <SourceBadge source={song.source} />
        </div>

        {song.source !== "spotify" && (
          <>
            <div className="space-y-1.5">
              <Slider
                value={[currentTime]}
                max={getDuration()}
                step={1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(getDuration())}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Button onClick={onPrevious} disabled={!hasPrevious} variant="ghost" size="icon" className="h-8 w-8">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button onClick={handlePlayPause} variant="ghost" size="icon" className="h-8 w-8">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button onClick={onNext} disabled={!hasNext} variant="ghost" size="icon" className="h-8 w-8">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1.5">
                <Button onClick={toggleMute} variant="ghost" size="icon" className="h-7 w-7">
                  {isMuted || volume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
