import { NextResponse } from "next/server"
import { createERPNextDoc } from "@/lib/erpnext"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Create room service order in ERPNext
    const roomServiceOrder = await createERPNextDoc("Room Service Order", {
      doctype: "Room Service Order",
      room_number: body.room_number,
      status: "Pending",
      items: [{
        item_code: body.item_code,
        quantity: body.quantity,
        notes: body.notes || ""
      }]
    })

    return NextResponse.json(roomServiceOrder)
  } catch (error) {
    console.error("Error creating room service order:", error)
    return NextResponse.json(
      { error: "Failed to create room service order" },
      { status: 500 }
    )
  }
}
