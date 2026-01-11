import { NextResponse } from "next/server";
import { runSimulationCycle } from "@/lib/simulation";

// POST to manually trigger simulation (for testing)
// In production, this would be called by a cron job
export async function POST(request: Request) {
  try {
    // Verify secret key for cron protection
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runSimulationCycle();

    return NextResponse.json({
      success: true,
      interactions: result.interactions.length,
      events: result.events.length,
      confessionals: result.confessionals.length,
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { error: "Simulation failed" },
      { status: 500 }
    );
  }
}
