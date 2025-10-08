"use client"

import { useMemo } from "react"
import { formatDistanceStrict } from "date-fns"

import { MetricCard } from "@/components/web3/metrics-cards"
import { useRedemptionQueue } from "@/hooks/use-redemption-queue"
import { useVaultMetrics } from "@/hooks/use-vault-metrics"

export function RedemptionQueue() {
  const metrics = useVaultMetrics()
  const queue = useRedemptionQueue(metrics.data?.currentEpoch)

  const timeRemaining = useMemo(() => {
    if (!metrics.data) return "--"
    const epochEnd = metrics.data.currentEpochStart + metrics.data.preLockRedemptionPeriod
    if (!epochEnd) return "--"
    if (Date.now() / 1000 > epochEnd) return "Window closed"
    return formatDistanceStrict(Date.now(), epochEnd * 1000)
  }, [metrics.data])

  return (
    <section className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Redemption Queue
      </h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Current Epoch"
          value={queue.data?.epoch}
          loading={queue.isLoading}
        />
        <MetricCard
          title="Shares Queued"
          value={queue.data?.sharesQueued?.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
          description="Total stPENDLE awaiting redemption this epoch."
          loading={queue.isLoading}
        />
        <MetricCard
          title="Available PENDLE"
          value={queue.data?.available?.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
          description="Unlocked PENDLE ready for redemptions."
          loading={queue.isLoading}
        />
        <MetricCard
          title="Window Remaining"
          value={timeRemaining}
          description="Time left before the window closes."
          loading={metrics.isLoading}
        />
      </div>
      <MetricCard
        title="Estimated Clear Time"
        value={queue.data?.estimatedEpochsToClear ? `${queue.data.estimatedEpochsToClear} epochs` : "--"}
        description="Approximate epochs required to fulfill current queue."
        disclaimer="Estimates assume no new deposits or withdrawals."
        loading={queue.isLoading}
      />
    </section>
  )
}
