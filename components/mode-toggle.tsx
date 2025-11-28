"use client"

import { Dumbbell, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppMode } from '@/contexts/app-mode-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const { mode } = useAppMode();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 rounded-full bg-muted/50 p-1">
      <Button
        variant={mode === 'training' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => router.push('/dashboard')}
        className={cn(
          "h-8 rounded-full px-3 text-xs font-semibold transition-all duration-200",
          mode === 'training'
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            : "text-muted-foreground hover:text-foreground hover:bg-transparent"
        )}
      >
        <Dumbbell className="mr-1.5 h-3.5 w-3.5" />
        Training
      </Button>
      <Button
        variant={mode === 'discovery' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => router.push('/discovery')}
        className={cn(
          "h-8 rounded-full px-3 text-xs font-semibold transition-all duration-200",
          mode === 'discovery'
            ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
            : "text-muted-foreground hover:text-foreground hover:bg-transparent"
        )}
      >
        <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
        Discovery
      </Button>
    </div>
  );
}
