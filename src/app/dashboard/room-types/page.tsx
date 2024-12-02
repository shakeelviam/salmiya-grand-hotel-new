import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoomTypeForm } from "./room-type-form"
import { prisma } from "@/lib/db"

export default async function RoomTypesPage() {
  const roomTypes = await prisma.roomType.findMany({
    include: {
      _count: {
        select: { rooms: true }
      }
    }
  })

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Room Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RoomTypeForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roomTypes.map((roomType) => (
                <Card key={roomType.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{roomType.name}</h3>
                        <p className="text-sm text-gray-500">{roomType.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${roomType.basePrice.toString()}</p>
                        <p className="text-sm text-gray-500">
                          {roomType._count.rooms} rooms
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm">Capacity: {roomType.capacity} persons</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {roomType.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
