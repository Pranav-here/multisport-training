"use client"

import { useState } from 'react';
import { CONTENT_TAGS } from '@/lib/discovery/constants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface ContentTagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export function ContentTagSelector({
  selectedTags,
  onChange,
  maxTags = 3,
}: ContentTagSelectorProps) {
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(t => t !== tagId));
    } else {
      if (selectedTags.length < maxTags) {
        onChange([...selectedTags, tagId]);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">
          What makes this clip special? (Select up to {maxTags})
        </Label>
        <span className="text-xs text-muted-foreground">
          {selectedTags.length} / {maxTags}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {CONTENT_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          const isDisabled = !isSelected && selectedTags.length >= maxTags;

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => !isDisabled && toggleTag(tag.id)}
              disabled={isDisabled}
              className={cn(
                "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all duration-200",
                isSelected
                  ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                  : "border-border bg-background hover:border-green-300 hover:bg-accent",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{tag.icon}</span>
                <span className="text-sm font-semibold">{tag.label}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {tag.description}
              </p>
            </button>
          );
        })}
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-md bg-muted/50 p-3">
          <span className="text-xs font-semibold text-muted-foreground">Selected:</span>
          {selectedTags.map((tagId) => {
            const tag = CONTENT_TAGS.find(t => t.id === tagId);
            return tag ? (
              <Badge key={tagId} variant="secondary" className="bg-green-600 text-white">
                {tag.icon} {tag.label}
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
