"use client"

import { PostDestination } from '@/lib/discovery/types';
import { Dumbbell, TrendingUp, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PostDestinationSelectorProps {
  value: PostDestination;
  onChange: (destination: PostDestination) => void;
  suggestDiscovery?: boolean;
}

export function PostDestinationSelector({
  value,
  onChange,
  suggestDiscovery = false,
}: PostDestinationSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Where should this clip appear?</Label>
        {suggestDiscovery && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            ✨ Recommended for Discovery
          </span>
        )}
      </div>

      <RadioGroup value={value} onValueChange={(v) => onChange(v as PostDestination)}>
        <div className="space-y-2">
          {/* Training Only */}
          <label
            htmlFor="training_only"
            className={cn(
              "flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all duration-200",
              value === 'training_only'
                ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                : "border-border bg-background hover:border-blue-300 hover:bg-accent"
            )}
          >
            <RadioGroupItem value="training_only" id="training_only" className="mt-1" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-sm">Training Only</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Personal training log. Only visible to you and your connections.
              </p>
            </div>
          </label>

          {/* Discovery Only */}
          <label
            htmlFor="discovery_only"
            className={cn(
              "flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all duration-200",
              value === 'discovery_only'
                ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                : "border-border bg-background hover:border-green-300 hover:bg-accent",
              suggestDiscovery && "ring-2 ring-green-300 ring-offset-2"
            )}
          >
            <RadioGroupItem value="discovery_only" id="discovery_only" className="mt-1" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-sm">Discovery Feed</span>
                {suggestDiscovery && (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                    Suggested
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Share with scouts and the community. Get discovered by college coaches.
              </p>
            </div>
          </label>

          {/* Both */}
          <label
            htmlFor="both"
            className={cn(
              "flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all duration-200",
              value === 'both'
                ? "border-purple-600 bg-purple-50 dark:bg-purple-950/30"
                : "border-border bg-background hover:border-purple-300 hover:bg-accent"
            )}
          >
            <RadioGroupItem value="both" id="both" className="mt-1" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-sm">Both</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Add to training log AND share in Discovery feed for maximum exposure.
              </p>
            </div>
          </label>
        </div>
      </RadioGroup>
    </div>
  );
}
