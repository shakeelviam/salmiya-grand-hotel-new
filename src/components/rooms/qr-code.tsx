"use client"

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeProps {
  roomId: string
  size?: number
}

export function RoomQRCode({ roomId, size = 200 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      // Create URL for room service
      const roomServiceUrl = `${window.location.origin}/room-service/${roomId}`
      
      // Generate QR code
      QRCode.toCanvas(canvasRef.current, roomServiceUrl, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
    }
  }, [roomId, size])

  return <canvas ref={canvasRef} />
}
