import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

// Initialize Prisma Client
// const prisma = new PrismaClient()

async function uploadFile(file: File) {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const uniqueId = uuidv4()
    const originalName = file.name
    const extension = originalName.split(".").pop()
    const fileName = `${uniqueId}.${extension}`

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads")
    try {
      await writeFile(join(uploadDir, fileName), buffer)
    } catch (error) {
      // If directory doesn't exist, create it and try again
      const { mkdir } = require("fs/promises")
      await mkdir(uploadDir, { recursive: true })
      await writeFile(join(uploadDir, fileName), buffer)
    }

    return `/uploads/${fileName}`
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    // Handle passport copy upload
    let passportCopy = null
    const passportFile = formData.get("passportCopy") as File
    if (passportFile) {
      passportCopy = await uploadFile(passportFile)
    }

    // Handle other documents upload
    let otherDocuments: string[] = []
    const otherDocs = formData.getAll("otherDocuments") as File[]
    if (otherDocs.length > 0) {
      for (const doc of otherDocs) {
        const fileUrl = await uploadFile(doc)
        otherDocuments.push(fileUrl)
      }
    }

    // Get form data
    const guestData = {
      name: formData.get("guestName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      nationality: formData.get("nationality") as string,
      passportNumber: formData.get("passportNumber") as string,
      civilId: (formData.get("civilId") as string) || null,
      visaNumber: (formData.get("visaNumber") as string) || null,
      passportCopy,
      otherDocuments,
      vipStatus: formData.get("vipStatus") === "true",
      notes: (formData.get("notes") as string) || "",
    }

    // Validate required fields
    if (!guestData.name || !guestData.email || !guestData.phone || !guestData.nationality || !guestData.passportNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create guest with all data
    const guest = await prisma.guest.create({
      data: guestData,
    })

    return NextResponse.json(guest)
  } catch (error) {
    console.error("Error creating guest:", error)
    if (error instanceof Error) {
      // Check for unique constraint violation
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "A guest with this email already exists" },
          { status: 400 }
        )
      }
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create guest" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(guests)
  } catch (error) {
    console.error("Error fetching guests:", error)
    return NextResponse.json(
      { error: "Failed to fetch guests" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
