import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getOrCreateFingerprint } from "./fingerprint"

export type Song = {
  id: string
  title: string
  artist: string
  source: "youtube-music" | "youtube-video" | "spotify"
  url: string
  thumbnail?: string | null
  addedBy: string
  addedByFingerprint: string
  duration?: number | null
  createdAt: string
}

export function useSongs() {
  return useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const response = await fetch("/api/songs")
      if (!response.ok) {
        throw new Error("Failed to fetch songs")
      }
      return response.json() as Promise<Song[]>
    },
    refetchInterval: 3000,
  })
}

export function useAddSong() {
  const queryClient = useQueryClient()
  const fingerprint = getOrCreateFingerprint()

  return useMutation({
    mutationFn: async (song: Omit<Song, "id" | "addedBy" | "addedByFingerprint" | "createdAt">) => {
      const response = await fetch("/api/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...song,
          fingerprint,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add song")
      }

      return response.json() as Promise<Song>
    },
    onMutate: async (newSong) => {
      await queryClient.cancelQueries({ queryKey: ["songs"] })

      const previousSongs = queryClient.getQueryData<Song[]>(["songs"])

      const optimisticSong: Song = {
        id: `temp-${Date.now()}`,
        ...newSong,
        addedBy: "You",
        addedByFingerprint: fingerprint,
        createdAt: new Date().toISOString(),
      }

      queryClient.setQueryData<Song[]>(["songs"], (old = []) => [optimisticSong, ...old])

      return { previousSongs }
    },
    onError: (_err, _newSong, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData(["songs"], context.previousSongs)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] })
    },
  })
}

export function useDeleteSong() {
  const queryClient = useQueryClient()
  const fingerprint = getOrCreateFingerprint()

  return useMutation({
    mutationFn: async (songId: string) => {
      const response = await fetch(`/api/songs/${songId}`, {
        method: "DELETE",
        headers: {
          "x-fingerprint": fingerprint,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete song")
      }

      return songId
    },
    onMutate: async (songId) => {
      await queryClient.cancelQueries({ queryKey: ["songs"] })

      const previousSongs = queryClient.getQueryData<Song[]>(["songs"])

      queryClient.setQueryData<Song[]>(
        ["songs"],
        (old = []) => old.filter((song) => song.id !== songId)
      )

      return { previousSongs }
    },
    onError: (_err, _songId, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData(["songs"], context.previousSongs)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] })
    },
  })
}

export function useNowPlaying() {
  return useQuery({
    queryKey: ["now-playing"],
    queryFn: async () => {
      const response = await fetch("/api/now-playing")
      if (!response.ok) {
        throw new Error("Failed to fetch now playing")
      }
      const data = await response.json()
      return data.currentSong as Song | null
    },
    refetchInterval: 3000,
  })
}

export function useSetNowPlaying() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (songId: string) => {
      const response = await fetch("/api/now-playing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ songId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to set now playing")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["now-playing"] })
    },
  })
}

