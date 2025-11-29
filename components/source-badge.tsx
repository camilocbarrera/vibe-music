import { cn } from "@/lib/utils"

type SourceBadgeProps = {
  source: "youtube-music" | "youtube-video" | "spotify"
  size?: "sm" | "md"
}

export function SourceBadge({ source, size = "md" }: SourceBadgeProps) {
  const configs = {
    "youtube-music": {
      label: "YT Music",
      className: "bg-red-500/10 text-red-600 border-red-500/20",
    },
    "youtube-video": {
      label: "YouTube",
      className: "bg-red-500/10 text-red-600 border-red-500/20",
    },
    spotify: {
      label: "Spotify",
      className: "bg-green-500/10 text-green-600 border-green-500/20",
    },
  }

  const config = configs[source]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium",
        config.className,
        size === "sm" && "px-2 py-0 text-[10px]",
      )}
    >
      {config.label}
    </span>
  )
}
