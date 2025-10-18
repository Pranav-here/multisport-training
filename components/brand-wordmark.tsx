import { cn } from "@/lib/utils"

type BrandWordmarkProps = {
  className?: string
}

export function BrandWordmark({ className }: BrandWordmarkProps) {
  return (
    <span className={cn("brand-wordmark", className)} aria-label="AthletIQs">
      <span className="brand-base">
        <span className="brand-at">AT</span>
        <span className="brand-h">H</span>
        <span className="brand-let">LET</span>
      </span>
      <span className="brand-iq">
        <span className="brand-i">I</span>
        <span className="brand-q">
          Q
          <span aria-hidden className="brand-q-notch" />
          <span aria-hidden className="brand-q-tail" />
        </span>
      </span>
      <span className="brand-s">S</span>
    </span>
  )
}
