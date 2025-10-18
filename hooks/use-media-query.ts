import { useEffect, useState } from "react"

/**
 * Lightweight matchMedia hook for responsive components. Falls back to false during SSR.
 */
export function useMediaQuery(query: string) {
  const getMatch = () => (typeof window === "undefined" ? false : window.matchMedia(query).matches)

  const [matches, setMatches] = useState<boolean>(getMatch)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const media = window.matchMedia(query)

    const handler = () => setMatches(media.matches)

    handler()

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handler)
    } else {
      media.addListener(handler)
    }

    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", handler)
      } else {
        media.removeListener(handler)
      }
    }
  }, [query])

  return matches
}
