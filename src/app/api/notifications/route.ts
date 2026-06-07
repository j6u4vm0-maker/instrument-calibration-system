import { NextResponse } from "next/server";
import { GageService } from "@/services/gage-service";

export async function GET() {
  try {
    const notifications = await GageService.getActiveReminders();
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
