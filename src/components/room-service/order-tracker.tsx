import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ClockIcon,
  CheckCircleIcon,
  ChefHatIcon,
  TruckIcon,
} from "lucide-react"

interface OrderStatus {
  status: "pending" | "preparing" | "delivering" | "delivered"
  timestamp: string
}

interface OrderTrackerProps {
  orderId: string
  initialStatus: OrderStatus
  onStatusUpdate?: (status: OrderStatus) => void
}

const statusSteps = [
  {
    status: "pending",
    label: "Order Received",
    icon: ClockIcon,
  },
  {
    status: "preparing",
    label: "Preparing Order",
    icon: ChefHatIcon,
  },
  {
    status: "delivering",
    label: "Out for Delivery",
    icon: TruckIcon,
  },
  {
    status: "delivered",
    label: "Delivered",
    icon: CheckCircleIcon,
  },
] as const

export function OrderTracker({
  orderId,
  initialStatus,
  onStatusUpdate,
}: OrderTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialStatus)

  useEffect(() => {
    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/order-tracking/${orderId}`
    )

    ws.onmessage = (event) => {
      const status = JSON.parse(event.data)
      setCurrentStatus(status)
      onStatusUpdate?.(status)
    }

    return () => {
      ws.close()
    }
  }, [orderId, onStatusUpdate])

  const currentStep = statusSteps.findIndex(
    (step) => step.status === currentStatus.status
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4 pb-4">
          <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStep
            const isCurrent = index === currentStep
            return (
              <div
                key={step.status}
                className={`relative flex items-center space-x-4 pl-8 ${
                  isCompleted ? "text-primary" : "text-gray-500"
                }`}
              >
                <div
                  className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{step.label}</p>
                  {isCurrent && (
                    <p className="text-sm text-gray-500">
                      {new Date(currentStatus.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          Order #{orderId}
        </div>
      </CardContent>
    </Card>
  )
}
