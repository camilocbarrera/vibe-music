import { nanoid } from "nanoid"

const FINGERPRINT_KEY = "vibe-playlist-fingerprint"

export function getOrCreateFingerprint(): string {
  if (typeof window === "undefined") {
    return nanoid()
  }

  let fingerprint = localStorage.getItem(FINGERPRINT_KEY)
  if (!fingerprint) {
    fingerprint = nanoid()
    localStorage.setItem(FINGERPRINT_KEY, fingerprint)
  }
  return fingerprint
}

