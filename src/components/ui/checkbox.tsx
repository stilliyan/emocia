"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-black/20 bg-background outline-none after:absolute after:-inset-x-3 after:-inset-y-3 transition-[border-color,background-color,box-shadow] duration-150 group-has-disabled/field:opacity-50 hover:border-black/35 focus-visible:border-black/55 focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/10 aria-invalid:aria-checked:border-primary dark:border-white/20 dark:bg-input/30 dark:hover:border-white/35 dark:focus-visible:border-white/55 dark:focus-visible:ring-white/10 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/20 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
