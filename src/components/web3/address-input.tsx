"use client"

import * as React from "react"
import { Hex } from "viem"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type AddressInputProps = {
  label?: string
  placeholder?: string
  value?: string
  onSubmit?: (address: Hex) => void
  buttonLabel?: string
  className?: string
}

export function AddressInput({
  label = "Address",
  placeholder = "0x...",
  value,
  onSubmit,
  buttonLabel = "Set",
  className,
}: AddressInputProps) {
  const [internalValue, setInternalValue] = React.useState(value ?? "")

  return (
    <form
      className={cn("flex flex-col gap-2", className)}
      onSubmit={(event) => {
        event.preventDefault()
        if (internalValue && internalValue.startsWith("0x") && internalValue.length === 42) {
          onSubmit?.(internalValue as Hex)
        }
      }}
    >
      <Label htmlFor="address-input" className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          id="address-input"
          value={internalValue}
          placeholder={placeholder}
          onChange={(event) => setInternalValue(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          className="font-mono text-xs"
        />
        <Button type="submit" size="sm">
          {buttonLabel}
        </Button>
      </div>
    </form>
  )
}
