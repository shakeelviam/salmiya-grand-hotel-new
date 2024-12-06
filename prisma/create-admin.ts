import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    const hashedPassword = await hash('Marsha@2003', 12)
    
    const user = await prisma.user.upsert({
      where: { email: 'shakeel.viam@gmail.com' },
      update: {
        role: 'ADMIN',
        password: hashedPassword
      },
      create: {
        email: 'shakeel.viam@gmail.com',
        name: 'Shakeel',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    console.log('Admin user created:', user)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
