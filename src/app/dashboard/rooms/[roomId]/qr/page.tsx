'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { QRCodeCanvas } from "qrcode.react"

export default function RoomQRPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${params.roomId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch room')
        }
        const data = await response.json()
        setRoom(data)
      } catch (error) {
        console.error('Error fetching room:', error)
        toast({
          title: "Error",
          description: "Failed to load room details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.roomId) {
      fetchRoom()
    }
  }, [params.roomId, toast])

  const handleDownload = () => {
    const canvas = document.getElementById('room-qr') as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream")
      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `room-${room.number}-qr.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-[300px] mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-semibold mb-4">Room not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Room {room.number} QR Code</h1>
        </div>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room QR Code</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeCanvas
              id="room-qr"
              value={`${window.location.origin}/room-service/${room.id}`}
              size={300}
              level="H"
              includeMargin
            />
          </div>
          <p className="mt-4 text-center text-muted-foreground">
            Scan this QR code to access room service for room {room.number}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
