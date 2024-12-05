import { useState, useEffect } from "react"

interface Room {
  id: string
  number: string
  type: string
  floor: number
  capacity: number
  basePrice: number
  status: string
  amenities: string[]
  description?: string
}

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/rooms")
      if (!response.ok) throw new Error("Failed to fetch rooms")
      const data = await response.json()
      setRooms(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  return { rooms, isLoading, error, refetch: fetchRooms }
}
