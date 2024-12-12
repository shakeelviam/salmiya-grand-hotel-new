import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // First, get or create the King Room type
  let kingRoomType = await prisma.roomType.findFirst({
    where: { name: 'King Room' }
  })

  if (!kingRoomType) {
    kingRoomType = await prisma.roomType.create({
      data: {
        name: 'King Room',
        description: 'Luxurious king-sized room with modern amenities',
        adultCapacity: 2,
        childCapacity: 2,
        extraBedCharge: 15.0,
        basePrice: 100.0,
        isActive: true
      }
    })
    console.log('Created King Room type:', kingRoomType)
  }

  // Create some rooms of King Room type
  const roomsToCreate = [
    { number: '101', floor: '1' },
    { number: '102', floor: '1' },
    { number: '103', floor: '1' },
    { number: '201', floor: '2' },
    { number: '202', floor: '2' }
  ]

  for (const room of roomsToCreate) {
    const existingRoom = await prisma.room.findUnique({
      where: { number: room.number }
    })

    if (!existingRoom) {
      const newRoom = await prisma.room.create({
        data: {
          number: room.number,
          floor: room.floor,
          description: `King Room ${room.number} on floor ${room.floor}`,
          isActive: true,
          isAvailable: true,
          status: 'AVAILABLE',
          roomTypeId: kingRoomType.id
        }
      })
      console.log('Created room:', newRoom)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
