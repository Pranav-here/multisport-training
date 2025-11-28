import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from '@/lib/utils'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = ({ className, sideOffset = 8, ...props }: TooltipPrimitive.TooltipContentProps) => (
  <TooltipPrimitive.Content
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border border-white/10 bg-background/95 px-3 py-2 text-sm text-foreground shadow-lg',
      className,
    )}
    {...props}
  />
)

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
