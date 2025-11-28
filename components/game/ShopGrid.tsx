import {
  Heart,
  Key,
  Shield,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BOOSTER_COSTS } from "@/lib/game/types";
import { cn } from "@/lib/utils";

type BoosterKind = keyof typeof BOOSTER_COSTS;

type ShopGridProps = {
  coins: number;
  inventory: Record<string, number>;
  onPurchase: (booster: BoosterKind) => void;
  className?: string;
};

const BOOSTER_COPY: Record<
  BoosterKind,
  { title: string; description: string; icon: React.ReactNode }
> = {
  extraHeart: {
    title: "Extra Heart",
    description: "Refill one heart instantly",
    icon: <Heart className="h-6 w-6 text-rose-400" />,
  },
  starDoubler: {
    title: "Star Doubler",
    description: "Double coins next session",
    icon: <Sparkles className="h-6 w-6 text-amber-400" />,
  },
  gateKey: {
    title: "Gate Key",
    description: "Unlock any gate instantly",
    icon: <Key className="h-6 w-6 text-purple-400" />,
  },
  streakFreeze: {
    title: "Streak Freeze",
    description: "Protect your streak for one missed day",
    icon: <Shield className="h-6 w-6 text-sky-400" />,
  },
};

export function ShopGrid({
  coins,
  inventory,
  onPurchase,
  className,
}: ShopGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {Object.entries(BOOSTER_COSTS).map(([id, cost]) => {
        const booster = id as BoosterKind;
        const copy = BOOSTER_COPY[booster];
        const owned = inventory[booster] ?? 0;
        const affordable = coins >= cost;

        return (
          <Card
            key={booster}
            className="flex h-full flex-col justify-between border-border/60 bg-background/80 shadow-xl backdrop-blur"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-muted/60">
                  {copy.icon}
                </span>
                <span>
                  {copy.title}
                  <span className="block text-xs font-medium text-muted-foreground">
                    Owned {owned}
                  </span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{copy.description}</p>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{cost} Coins</span>
                <Button
                  type="button"
                  size="sm"
                  className="rounded-full"
                  disabled={!affordable}
                  onClick={() => onPurchase(booster)}
                >
                  {affordable ? "Buy" : "Not enough"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
