import { NextResponse } from "next/server";
import { getTimelineEvents } from "@/lib/database";

export async function GET() {
  try {
    const events = await getTimelineEvents(100);
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
