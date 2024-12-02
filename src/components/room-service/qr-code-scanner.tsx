import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QRCodeScannerProps {
  onScan: (roomNumber: string) => void
}

export function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      )

      scannerRef.current.render(
        (decodedText) => {
          // Assuming QR code contains room number in format "room-123"
          const roomNumber = decodedText.split("-")[1]
          if (roomNumber) {
            onScan(roomNumber)
            stopScanner()
          } else {
            setError("Invalid QR code format")
          }
        },
        (error) => {
          console.error("QR Code scanning failed:", error)
        }
      )
    }

    return () => {
      stopScanner()
    }
  }, [isScanning, onScan])

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current
        .clear()
        .catch((error) => console.error("Failed to clear scanner:", error))
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Room QR Code</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 text-sm text-red-500">{error}</div>
        )}
        <div className="space-y-4">
          {!isScanning ? (
            <Button
              onClick={() => {
                setError(null)
                setIsScanning(true)
              }}
              className="w-full"
            >
              Start Scanning
            </Button>
          ) : (
            <>
              <div id="qr-reader" className="mx-auto max-w-sm" />
              <Button
                onClick={stopScanner}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
