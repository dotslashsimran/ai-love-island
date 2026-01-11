import { NextResponse } from "next/server";
import { getRecentInteractions } from "@/lib/database";

export async function GET() {
  try {
    const interactions = await getRecentInteractions(50);
    return NextResponse.json(interactions);
  } catch (error) {
    console.error("Error fetching interactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch interactions" },
      { status: 500 }
    );
  }
}
