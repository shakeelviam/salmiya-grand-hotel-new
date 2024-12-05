import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withPermission } from '@/lib/permissions'
import { hash } from 'bcryptjs'

// Validation schema for user
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).default('STAFF'),
})

// GET: Fetch all users
export const GET = withPermission(
  async function GET(req: Request) {
    try {
      const { searchParams } = new URL(req.url)
      const role = searchParams.get('role')
      const email = searchParams.get('email')

      const where = {
        ...(role && { role: role as 'ADMIN' | 'MANAGER' | 'STAFF' }),
        ...(email && { email }),
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return NextResponse.json(users)
    } catch (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }
  },
  { action: 'READ', subject: 'user' }
)

// POST: Create a new user
export const POST = withPermission(
  async function POST(req: Request) {
    try {
      const body = await req.json()
      const validatedData = userSchema.parse(body)

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }

      // Hash the password
      const hashedPassword = await hash(validatedData.password, 12)

      // Create the user
      const user = await prisma.user.create({
        data: {
          ...validatedData,
          hashedPassword,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      // If permissions are provided, create role permissions
      if (body.permissions && Array.isArray(body.permissions)) {
        await prisma.rolePermission.createMany({
          data: body.permissions.map((permissionId: string) => ({
            userId: user.id,
            permissionId,
          })),
        })
      }

      return NextResponse.json(user, { status: 201 })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ errors: error.errors }, { status: 400 })
      }
      console.error('Error creating user:', error)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }
  },
  { action: 'CREATE', subject: 'user' }
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
      validatedData.hashedPassword = await hash(validatedData.password, 12)
      delete validatedData.password
    }

    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
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
