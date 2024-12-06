import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'shakeel.viam@gmail.com' },
      include: { roles: true }
    })

    if (existingUser) {
      console.log('Admin user already exists')
      return
    }

    // Create admin role if it doesn't exist
    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'Administrator with full system access'
      }
    })

    console.log('Admin role created/found:', adminRole)

    // Create admin user
    const hashedPassword = await hash('Marsha@2003', 12)
    const adminUser = await prisma.user.create({
      data: {
        email: 'shakeel.viam@gmail.com',
        name: 'Shakeel',
        password: hashedPassword,
        roles: {
          connect: {
            id: adminRole.id
          }
        }
      },
      include: {
        roles: true
      }
    })

    console.log('Admin user created:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      roles: adminUser.roles
    })

    // Create default permissions for admin role
    const permissions = [
      { name: 'manage_users', description: 'Manage system users', action: 'manage', subject: 'user' },
      { name: 'manage_roles', description: 'Manage user roles', action: 'manage', subject: 'role' },
      { name: 'manage_permissions', description: 'Manage role permissions', action: 'manage', subject: 'permission' },
      { name: 'manage_rooms', description: 'Manage hotel rooms', action: 'manage', subject: 'room' },
      { name: 'manage_bookings', description: 'Manage room bookings', action: 'manage', subject: 'booking' },
      { name: 'manage_guests', description: 'Manage guest information', action: 'manage', subject: 'guest' },
      { name: 'manage_payments', description: 'Manage payments', action: 'manage', subject: 'payment' },
      { name: 'view_reports', description: 'View system reports', action: 'read', subject: 'report' },
      { name: 'manage_settings', description: 'Manage system settings', action: 'manage', subject: 'setting' },
    ]

    for (const perm of permissions) {
      const permission = await prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: {
          name: perm.name,
          description: perm.description,
          action: perm.action,
          subject: perm.subject,
          roles: {
            connect: {
              id: adminRole.id
            }
          }
        }
      })
      console.log('Created permission:', permission.name)
    }

    console.log('Successfully created admin user with all permissions')
  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
