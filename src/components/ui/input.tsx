import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      data-lt-active="false"
      data-gramm="false"
      data-gramm_editor="false"
      data-enable-grammarly="false"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-black/15 bg-background px-3 py-2 text-base outline-none transition-[border-color,box-shadow,background-color] duration-150 hover:border-black/25 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-black/50 focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-muted/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/10 md:text-sm dark:border-white/15 dark:bg-input/30 dark:hover:border-white/25 dark:focus-visible:border-white/50 dark:focus-visible:ring-white/10 dark:disabled:border-white/10 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
