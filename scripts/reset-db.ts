import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Delete all data except the admin user
  await prisma.roomService.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.bill.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.room.deleteMany()
  await prisma.roomType.deleteMany()
  await prisma.service.deleteMany()
  await prisma.serviceCategory.deleteMany()
  await prisma.permissionHistory.deleteMany()
  await prisma.rolePermission.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.role.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany({
    where: {
      email: {
        not: "admin@salmiyagrandhotel.com"
      }
    }
  })

  console.log("Database reset completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
