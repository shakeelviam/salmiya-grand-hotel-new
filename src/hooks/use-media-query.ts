"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query)
      const updateMatch = () => setMatches(media.matches)

      // Set initial value
      updateMatch()

      // Listen for changes
      media.addEventListener("change", updateMatch)

      return () => {
        media.removeEventListener("change", updateMatch)
      }
    }
  }, [query])

  return matches
}
