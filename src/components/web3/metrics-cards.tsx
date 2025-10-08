"use client"

import { useMemo } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import { DEFAULT_DISPLAY_DECIMALS } from "@/config/constants"

export type MetricCardProps = {
  title: string
  description?: string
  value?: string | number
  change?: string
  loading?: boolean
  disclaimer?: string
  variant?: "default" | "warning" | "info"
}

const variantMap: Record<string, string> = {
  default: "",
  warning: "border-amber-500/60 bg-amber-50/5",
  info: "border-sky-500/60 bg-sky-50/5",
}

export function MetricCard({ title, description, value, change, loading, disclaimer, variant = "default" }: MetricCardProps) {
  const formatted = useMemo(() => {
    if (value === undefined || value === null) return "--"
    return typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: DEFAULT_DISPLAY_DECIMALS }) : value
  }, [value])

  return (
    <Card className={`border-border/60 bg-card/70 shadow-sm backdrop-blur ${variantMap[variant] ?? variantMap.default}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {change && <Badge variant="outline" className="text-xs font-normal">{change}</Badge>}
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-semibold tracking-tight text-foreground">
            {formatted}
          </div>
        )}
        {description && (
          <CardDescription className="text-xs text-muted-foreground/80">
            {description}
          </CardDescription>
        )}
        {disclaimer && (
          <p className="text-xs text-muted-foreground/70">{disclaimer}</p>
        )}
      </CardContent>
    </Card>
  )
}
