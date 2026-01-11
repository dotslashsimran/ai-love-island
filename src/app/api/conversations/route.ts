import { NextResponse } from "next/server";
import { getConversations, getConversationsForCharacter } from "@/lib/database";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get("characterId");
    
    let conversations;
    if (characterId) {
      conversations = await getConversationsForCharacter(characterId, 20);
    } else {
      conversations = await getConversations(50);
    }
    
    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
