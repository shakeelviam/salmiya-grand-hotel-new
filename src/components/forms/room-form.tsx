import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

interface RoomType {
  id: string
  name: string
}

interface RoomFormProps {
  roomTypes: RoomType[]
  initialData?: {
    id?: string
    number: string
    floor: string
    roomTypeId: string
    isAvailable: boolean
  }
  onSubmit: (data: FormData) => Promise<void>
}

export function RoomForm({ roomTypes, initialData, onSubmit }: RoomFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAvailable, setIsAvailable] = useState(initialData?.isAvailable ?? true)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)
      formData.set("isAvailable", isAvailable.toString())
      await onSubmit(formData)
      router.push("/dashboard/rooms")
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
        <Label htmlFor="number">Room Number</Label>
        <Input
          id="number"
          name="number"
          defaultValue={initialData?.number}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="floor">Floor</Label>
        <Input
          id="floor"
          name="floor"
          defaultValue={initialData?.floor}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="roomTypeId">Room Type</Label>
        <Select name="roomTypeId" defaultValue={initialData?.roomTypeId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a room type" />
          </SelectTrigger>
          <SelectContent>
            {roomTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isAvailable"
          checked={isAvailable}
          onCheckedChange={setIsAvailable}
          disabled={isLoading}
        />
        <Label htmlFor="isAvailable">Available for booking</Label>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : initialData ? "Update Room" : "Create Room"}
      </Button>
    </form>
  )
}
