"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"

interface QRCodeProps {
  roomId: string
  size?: number
}

export function RoomQRCode({ roomId, size = 200 }: QRCodeProps) {
  const [qrCode, setQrCode] = useState<string>("")

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Create URL for room service
        const roomServiceUrl = `${window.location.origin}/room-service/${roomId}`
        
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(roomServiceUrl)
        setQrCode(qrCodeDataUrl)
      } catch (error) {
        console.error("Error generating QR code:", error)
      }
    }

    generateQRCode()
  }, [roomId])

  if (!qrCode) {
    return <div>Loading QR Code...</div>
  }

  return (
    <div className="flex items-center justify-center">
      <img src={qrCode} alt="QR Code" className="w-48 h-48" />
    </div>
  )
}
