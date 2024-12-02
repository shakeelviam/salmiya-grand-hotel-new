import { NextResponse } from "next/server"
import { uploadFileToERPNext } from "@/lib/erpnext"

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

    // Upload to ERPNext
    const fileData = await uploadFileToERPNext(file)

    return NextResponse.json(fileData)
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
