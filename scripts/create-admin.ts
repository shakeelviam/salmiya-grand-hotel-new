import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Delete existing user with the same email if exists
    await prisma.user.deleteMany({
      where: {
        email: 'shakeel.viam@gmail.com'
      }
    })

    // Create admin role if it doesn't exist
    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'Administrator with full system access'
      }
    })

    const hashedPassword = await hash('Marsha@2003', 12)
    
    // Create admin user
    const user = await prisma.user.create({
      data: {
        name: 'Shakeel Mohammed Viam',
        email: 'shakeel.viam@gmail.com',
        password: hashedPassword,
        emailVerified: new Date(),
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

    // Create default permissions
    const permissions = [
      { name: 'manage_users', description: 'Manage system users', action: 'manage', subject: 'user' },
      { name: 'manage_roles', description: 'Manage user roles', action: 'manage', subject: 'role' },
      { name: 'manage_rooms', description: 'Manage hotel rooms', action: 'manage', subject: 'room' },
      { name: 'manage_reservations', description: 'Manage reservations', action: 'manage', subject: 'reservation' },
      { name: 'manage_payments', description: 'Manage payments', action: 'manage', subject: 'payment' },
      { name: 'manage_menu', description: 'Manage menu items', action: 'manage', subject: 'menu' },
      { name: 'manage_services', description: 'Manage hotel services', action: 'manage', subject: 'service' },
      { name: 'view_reports', description: 'View system reports', action: 'read', subject: 'report' },
      { name: 'manage_settings', description: 'Manage system settings', action: 'manage', subject: 'setting' }
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

      // Create role permission for the user
      await prisma.rolePermission.create({
        data: {
          userId: user.id,
          permissionId: permission.id
        }
      })
    }

    console.log('Created admin user:', {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map(r => r.name)
    })
    console.log('Successfully set up admin user with all permissions')

  } catch (error) {
    console.error('Error creating admin user:', error)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
