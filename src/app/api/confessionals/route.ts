import { NextResponse } from "next/server";
import { getConfessionals } from "@/lib/database";

export async function GET() {
  try {
    const confessionals = await getConfessionals(20);
    return NextResponse.json(confessionals);
  } catch (error) {
    console.error("Error fetching confessionals:", error);
    return NextResponse.json(
      { error: "Failed to fetch confessionals" },
      { status: 500 }
    );
  }
}
