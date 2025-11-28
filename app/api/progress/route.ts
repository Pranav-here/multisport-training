import { NextResponse } from "next/server";

import { mergeProgress, getProgress } from "@/lib/game/mock-db";
import { hydrateProgress } from "@/lib/game/progress";
import { Progress } from "@/lib/game/types";

export async function GET() {
  return NextResponse.json(getProgress());
}

export async function POST(request: Request) {
  const data = (await request.json().catch(() => ({}))) as Progress;
  const merged = mergeProgress(hydrateProgress(data));
  return NextResponse.json(merged);
}
