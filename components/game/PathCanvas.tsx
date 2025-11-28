import { useMemo } from "react";

import { Level } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { LevelNode } from "./LevelNode";

type PathCanvasProps = {
  levels: Level[];
  stars: Record<string, 0 | 1 | 2 | 3>;
  currentLevelId?: string | null;
  onSelectLevel?: (level: Level) => void;
  className?: string;
};

type Point = { x: number; y: number };

const NODE_SPACING = 140;
const AMPLITUDE = 80;
const BASELINE = 160;

const generatePoint = (index: number): Point => {
  const x = index * NODE_SPACING;
  const y = BASELINE + Math.sin(index / 2) * AMPLITUDE;
  return { x, y };
};

const buildPath = (points: Point[]) => {
  if (!points.length) return "";
  return points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const prev = points[index - 1];
      const midX = (prev.x + point.x) / 2;
      return `C ${midX} ${prev.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
    })
    .join(" ");
};

export function PathCanvas({
  levels,
  stars,
  currentLevelId,
  onSelectLevel,
  className,
}: PathCanvasProps) {
  const points = useMemo(
    () => levels.map((_, index) => generatePoint(index)),
    [levels],
  );

  const pathD = useMemo(() => buildPath(points), [points]);
  const width =
    (levels.length - 1) * NODE_SPACING + NODE_SPACING + AMPLITUDE * 2;
  const height = BASELINE + AMPLITUDE * 2;

  return (
    <div
      className={cn(
        "relative h-[360px] min-w-full overflow-hidden rounded-3xl bg-gradient-to-b from-sky-400/10 via-background to-background",
        className,
      )}
    >
      <svg
        width={width}
        height={height}
        className="absolute inset-0 -left-20"
        role="presentation"
      >
        <path
          d={pathD}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.35}
        />
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0" style={{ width }}>
        {levels.map((level, index) => {
          const point = points[index];
          const starsEarned = stars[level.id] ?? 0;
          const isCurrent = currentLevelId === level.id;
          return (
            <div
              key={level.id}
              className="absolute"
              style={{
                left: point.x,
                top: point.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <LevelNode
                level={level}
                stars={starsEarned}
                isCurrent={isCurrent}
                onSelect={onSelectLevel}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
