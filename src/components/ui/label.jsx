'use client'

import * as React from "react"

import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "../../lib/utils" // ← alias 제거 적용된 형태 유지

export function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
