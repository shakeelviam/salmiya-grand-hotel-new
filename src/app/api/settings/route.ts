import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";

export async function GET() {
  try {
    // Get the first settings record or create default
    const settings = await prisma.hotelSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    }) || await prisma.hotelSettings.create({
      data: {
        checkInTime: '14:00',
        checkOutTime: '12:00',
        earlyCheckOutPolicy: {
          type: 'NO_PENALTY',
          value: 0
        },
        noShowPolicy: {
          retainAdvance: true,
          refundPercentage: 0
        },
        lateCheckOutPolicy: {
          type: 'HOURLY',
          value: 50
        },
        autoCheckOut: {
          enabled: true,
          gracePeriod: 30
        }
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_GET_ERROR]", error);
    return NextResponse.json(
      { message: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check permissions
    const hasPermission = await checkPermission(session.user.id, "admin");
    if (!hasPermission) {
      return NextResponse.json(
        { message: "Only administrators can modify settings" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.checkInTime || !data.checkOutTime) {
      return NextResponse.json(
        { message: "Check-in and check-out times are required" },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await prisma.hotelSettings.upsert({
      where: {
        id: (await prisma.hotelSettings.findFirst())?.id || 'default'
      },
      update: {
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        earlyCheckOutPolicy: data.earlyCheckOutPolicy,
        noShowPolicy: data.noShowPolicy,
        lateCheckOutPolicy: data.lateCheckOutPolicy,
        autoCheckOut: data.autoCheckOut
      },
      create: {
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        earlyCheckOutPolicy: data.earlyCheckOutPolicy,
        noShowPolicy: data.noShowPolicy,
        lateCheckOutPolicy: data.lateCheckOutPolicy,
        autoCheckOut: data.autoCheckOut
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_UPDATE_ERROR]", error);
    return NextResponse.json(
      { message: "Failed to update settings" },
      { status: 500 }
    );
  }
}
