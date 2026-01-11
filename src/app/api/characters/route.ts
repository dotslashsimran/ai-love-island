import { NextResponse } from "next/server";
import { getCharacters } from "@/lib/database";

export async function GET() {
  try {
    const characters = await getCharacters();
    return NextResponse.json(characters);
  } catch (error) {
    console.error("Error fetching characters:", error);
    return NextResponse.json(
      { error: "Failed to fetch characters" },
      { status: 500 }
    );
  }
}
