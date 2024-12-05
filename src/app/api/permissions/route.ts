import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withPermission } from "@/lib/permissions"

// GET: Fetch all permissions
export const GET = withPermission(
  async function GET() {
    try {
      const permissions = await prisma.permission.findMany({
        orderBy: {
          subject: "asc",
        },
      })

      return NextResponse.json(permissions)
    } catch (error) {
      console.error("Error fetching permissions:", error)
      return NextResponse.json(
        { error: "Failed to fetch permissions" },
        { status: 500 }
      )
    }
  },
  { action: "READ", subject: "permission" }
)

// POST: Create a new permission
export const POST = withPermission(
  async function POST(request: Request) {
    try {
      const json = await request.json()

      // Validate required fields
      if (!json.name || !json.action || !json.subject) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        )
      }

      // Check if permission already exists
      const existingPermission = await prisma.permission.findFirst({
        where: {
          action: json.action,
          subject: json.subject,
        },
      })

      if (existingPermission) {
        return NextResponse.json(
          { error: "Permission already exists" },
          { status: 400 }
        )
      }

      // Create the permission
      const permission = await prisma.permission.create({
        data: {
          name: json.name,
          description: json.description,
          action: json.action,
          subject: json.subject,
        },
      })

      return NextResponse.json(permission)
    } catch (error) {
      console.error("Error creating permission:", error)
      return NextResponse.json(
        { error: "Failed to create permission" },
        { status: 500 }
      )
    }
  },
  { action: "CREATE", subject: "permission" }
)
