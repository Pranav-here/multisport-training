"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ShopGrid } from "@/components/game";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGameStore } from "@/lib/game/store";

export default function ShopPage() {
  const router = useRouter();
  const loadProgress = useGameStore((state) => state.loadProgress);
  const progress = useGameStore((state) => state.progress);
  const purchaseBooster = useGameStore((state) => state.purchaseBooster);
  const saveProgress = useGameStore((state) => state.saveProgress);
  const { toast } = useToast();

  useEffect(() => {
    loadProgress().catch(() => null);
  }, [loadProgress]);

  const handlePurchase = (booster: "extraHeart" | "starDoubler" | "gateKey" | "streakFreeze") => {
    const success = purchaseBooster(booster);
    if (!success) {
      toast({
        title: "Not enough coins",
        description: "Earn more coins by finishing sessions or quests.",
      });
      return;
    }
    saveProgress().catch(() => null);
    toast({
      title: "Booster added",
      description: "Check your inventory on the map to equip it.",
    });
  };

  const inventory = {
    extraHeart: progress.inventory.extraHearts,
    starDoubler: progress.inventory.doubler,
    gateKey: progress.inventory.keys,
    streakFreeze: progress.inventory.freeze,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 pb-12 pt-6 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
          <h1 className="text-3xl font-bold">Booster Shop</h1>
          <p className="mt-2 text-sm text-white/70">
            Spend coins to prepare for tougher worlds. Boosters activate instantly or can be equipped from the session preview.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">
              {progress.coins} Coins
            </span>
            <Button
              variant="outline"
              className="rounded-full border-white/30 text-white hover:bg-white/10"
              onClick={() => router.back()}
            >
              Back
            </Button>
          </div>
        </header>

        <ShopGrid
          coins={progress.coins}
          inventory={inventory}
          onPurchase={handlePurchase}
        />
      </div>
    </main>
  );
}
