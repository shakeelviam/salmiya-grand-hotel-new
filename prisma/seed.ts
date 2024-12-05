import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  // Create default admin users
  const adminUsers = [
    {
      email: 'admin@salmiya.com',
      name: 'Admin User',
      password: 'admin123',
      role: 'ADMIN',
    },
    {
      email: 'shakeel.viam@gmail.com',
      name: 'Shakeel',
      password: 'Marsha@2003',
      role: 'ADMIN',
    }
  ]

  for (const admin of adminUsers) {
    const hashedPassword = await hash(admin.password, 12)
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        name: admin.name,
        hashedPassword,
        role: admin.role as 'ADMIN',
      },
    })
  }

  // Create some default menu items
  const menuItems = [
    {
      id: uuidv4(),
      name: 'Club Sandwich',
      description: 'Classic triple-decker sandwich with chicken, bacon, lettuce, and tomato',
      price: 3.500,
      category: 'Food',
      isActive: true,
    },
    {
      id: uuidv4(),
      name: 'Caesar Salad',
      description: 'Crisp romaine lettuce, parmesan cheese, croutons with Caesar dressing',
      price: 2.750,
      category: 'Food',
      isActive: true,
    },
    {
      id: uuidv4(),
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice',
      price: 1.500,
      category: 'Beverages',
      isActive: true,
    },
  ]

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
