import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { withPermission } from '@/lib/permissions'
import { hash } from 'bcryptjs'
import { z } from 'zod'

// Create initial admin user
async function createInitialAdmin() {
  const existingAdmin = await prisma.user.findFirst({
    where: { 
      email: 'shakeel.viam@gmail.com',
      roles: {
        some: {
          name: 'ADMIN'
        }
      }
    },
    include: {
      roles: true
    }
  })

  if (!existingAdmin) {
    // First, create the ADMIN role if it doesn't exist
    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'Administrator role with full access'
      }
    })

    const hashedPassword = await hash('Marsha@2003', 12)
    
    // Create the admin user with the ADMIN role
    await prisma.user.create({
      data: {
        email: 'shakeel.viam@gmail.com',
        name: 'Shakeel Mohammed Viam',
        password: hashedPassword,
        roles: {
          connect: {
            id: adminRole.id
          }
        }
      },
    })

    console.log('Created initial admin user')
  }
}

// Call this when the server starts
createInitialAdmin()
  .catch(console.error)

// Validation schema for user
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.string().min(1, 'Role is required'),
})

// GET: Fetch all users
export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany({
      include: {
        roles: true
      },
      orderBy: [
        {
          updatedAt: 'desc'
        }
      ]
    })

    return NextResponse.json(users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      role: user.roles[0]?.name || 'STAFF',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })))
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { message: 'Failed to fetch users', error: String(error) },
      { status: 500 }
    )
  }
}

// POST: Create a new user
export const POST = withPermission(
  async function POST(req: Request) {
    try {
      const json = await req.json()
      const data = userSchema.parse(json)

      // Check if user with email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }

      // Hash the password
      const hashedPassword = await hash(data.password, 12)

      // Create the user with the role
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          roles: {
            connect: {
              id: data.roleId
            }
          }
        },
        include: {
          roles: true
        }
      })

      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        role: user.roles[0]?.name || 'STAFF',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors[0].message },
          { status: 400 }
        )
      }
      console.error('Error creating user:', error)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }
  },
  { action: "CREATE", subject: "user" }
)

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validatedData = userSchema.partial().parse(body)

    // If updating email, check if it's already taken
    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          NOT: { id },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 400 }
        )
      }
    }

    // If updating password, hash it
    if (validatedData.password) {
      validatedData.password = await hash(validatedData.password, 12)
    }

    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
