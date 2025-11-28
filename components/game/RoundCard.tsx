import Image from "next/image";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { SessionRound } from "@/lib/game/session";
import { cn } from "@/lib/utils";

type RoundCardProps = {
  round: SessionRound;
  index: number;
  total: number;
  selectedOption?: number | null;
  effortRating?: number;
  onSelectOption?: (optionIndex: number) => void;
  onEffortChange?: (value: number) => void;
};

export function RoundCard({
  round,
  index,
  total,
  selectedOption,
  effortRating = 3,
  onSelectOption,
  onEffortChange,
}: RoundCardProps) {
  const media = round.media;
  const heading = useMemo(() => {
    return `Round ${index + 1} of ${total}`;
  }, [index, total]);

  return (
    <article className="flex w-full flex-col gap-4 rounded-3xl border border-border/80 bg-background/90 p-5 shadow-lg backdrop-blur">
      <header className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {heading}
        </p>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {round.title}
        </span>
      </header>
      <p className="text-sm text-muted-foreground">{round.instruction}</p>

      {media ? (
        <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-muted">
          {media.type === "video" ? (
            <video
              src={media.src}
              poster={media.poster}
              className="h-full w-full object-cover"
              controls
              preload="metadata"
            />
          ) : (
            <Image
              fill
              priority={false}
              sizes="(max-width: 768px) 100vw, 600px"
              src={media.src}
              alt={media.alt}
              className="object-cover"
            />
          )}
        </div>
      ) : null}

      {round.quiz ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {round.quiz.question}
          </h3>
          <div className="grid gap-2">
            {round.quiz.options.map((option, optionIndex) => {
              const isSelected = selectedOption === optionIndex;
              return (
                <Button
                  key={option}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "justify-start rounded-xl border border-border/60 text-left text-sm",
                    isSelected && "border-primary shadow-md",
                  )}
                  onClick={() => onSelectOption?.(optionIndex)}
                >
                  {option}
                </Button>
              );
            })}
          </div>
        </section>
      ) : null}

      {round.requiresEffortRating ? (
        <section className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-muted-foreground">
            Self-rated effort
          </label>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={effortRating}
            onChange={(event) =>
              onEffortChange?.(Number(event.target.value))
            }
            className="h-2 w-full cursor-pointer rounded-full bg-primary/20 accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Easy</span>
            <span>Max</span>
          </div>
        </section>
      ) : null}
    </article>
  );
}
