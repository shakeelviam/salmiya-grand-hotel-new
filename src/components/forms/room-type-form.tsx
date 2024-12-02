import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RoomTypeFormProps {
  initialData?: {
    id?: string
    name: string
    description: string
    basePrice: number
    maxOccupancy: number
  }
  onSubmit: (data: FormData) => Promise<void>
}

export function RoomTypeForm({ initialData, onSubmit }: RoomTypeFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)
      await onSubmit(formData)
      router.push("/dashboard/room-types")
      router.refresh()
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Room Type Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialData?.description}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="basePrice">Base Price per Night</Label>
        <Input
          id="basePrice"
          name="basePrice"
          type="number"
          min="0"
          step="0.01"
          defaultValue={initialData?.basePrice}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxOccupancy">Maximum Occupancy</Label>
        <Input
          id="maxOccupancy"
          name="maxOccupancy"
          type="number"
          min="1"
          defaultValue={initialData?.maxOccupancy}
          required
          disabled={isLoading}
        />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : initialData ? "Update Room Type" : "Create Room Type"}
      </Button>
    </form>
  )
}
