import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Convert file to buffer
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

    // Return the URL path that can be used to access the file
    const fileUrl = `/uploads/${fileName}`

    return NextResponse.json({
      file_url: fileUrl,
      file_name: originalName
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
