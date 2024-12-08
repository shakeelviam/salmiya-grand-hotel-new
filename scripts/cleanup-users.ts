import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Delete all users except the admin
    await prisma.user.deleteMany({
      where: {
        email: {
          not: 'shakeel.viam@gmail.com'
        }
      }
    })

    // List remaining users
    const users = await prisma.user.findMany({
      include: {
        roles: true
      }
    })

    console.log('Remaining users:', users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map(r => r.name)
    })))

  } catch (error) {
    console.error('Error cleaning up users:', error)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
