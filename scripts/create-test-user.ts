import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await hash('password123', 12)
  
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'shakeel.viam@gmail.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('Created test user:', user)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
