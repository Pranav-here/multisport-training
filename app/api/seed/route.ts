import { NextResponse } from "next/server";

import { generateSeedLevels } from "@/lib/game/seed";

export function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    levels: generateSeedLevels(),
  });
}
