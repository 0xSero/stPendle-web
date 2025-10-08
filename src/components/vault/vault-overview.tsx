"use client"

import * as React from "react"
import { useAccount } from "wagmi"

import { AddressInput } from "@/components/web3/address-input"
import { MetricCard } from "@/components/web3/metrics-cards"
import { usePriceData } from "@/hooks/use-price-data"
import { useUserBalances } from "@/hooks/use-user-balances"
import { useVaultMetrics } from "@/hooks/use-vault-metrics"

export function VaultOverview() {
  const { address } = useAccount()
  const [manualAddress, setManualAddress] = React.useState<`0x${string}` | undefined>(address ?? undefined)

  const metrics = useVaultMetrics()
  const priceData = usePriceData()
  const balances = useUserBalances(manualAddress)

  const resolvedAddress = React.useMemo(
    () => manualAddress ?? (address as `0x${string}` | undefined),
    [manualAddress, address]
  )

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Wallet Overview
          </h3>
        </div>
        <AddressInput
          value={resolvedAddress}
          onSubmit={(value) => setManualAddress(value)}
          buttonLabel="Load"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard
            title="stPENDLE Balance"
            description="Vault shares held in the selected wallet."
            value={balances.data?.stPendleBalance?.toLocaleString(undefined, {
              maximumFractionDigits: 4,
            })}
            loading={balances.isLoading}
          />
          <MetricCard
            title="PENDLE Balance"
            description="Underlying PENDLE token balance."
            value={balances.data?.pendleBalance?.toLocaleString(undefined, {
              maximumFractionDigits: 4,
            })}
            loading={balances.isLoading}
          />
        </div>
        <MetricCard
          title="Queued Redemptions"
          description="Shares ready to claim during the active redemption window."
          value={balances.data?.requestedRedemptionShares?.toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })}
          loading={balances.isLoading}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Vault Metrics
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard
            title="Total Assets"
            description="Total PENDLE managed by the vault."
            value={metrics.data?.totalAssets?.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
            loading={metrics.isLoading}
          />
          <MetricCard
            title="Locked PENDLE"
            description="PENDLE locked in vePENDLE positions."
            value={metrics.data?.totalLockedPendle?.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
            loading={metrics.isLoading}
          />
          <MetricCard
            title="Epoch Duration"
            description="Length of each epoch in days."
            value={metrics.data ? (metrics.data.epochDuration / 86400).toFixed(1) : "--"}
            loading={metrics.isLoading}
          />
          <MetricCard
            title="NAV per Share"
            description="stPENDLE intrinsic value in PENDLE units."
            value={metrics.data?.navPerShare?.toFixed(4)}
            loading={metrics.isLoading}
          />
        </div>
      </section>

      <section className="space-y-4 lg:col-span-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Market Signals
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="PENDLE USD Price"
            description="Spot price sourced from Coingecko."
            value={priceData.pendlePrice ? `$${priceData.pendlePrice.toFixed(2)}` : "--"}
            loading={priceData.loading}
          />
          <MetricCard
            title="stPENDLE NAV (USD)"
            description="Intrinsic value translated to USD."
            value={priceData.navUsd ? `$${priceData.navUsd.toFixed(2)}` : "--"}
            loading={priceData.loading}
          />
          <MetricCard
            title="Discount / Premium"
            description="Difference between NAV and spot price."
            value={Number.isFinite(priceData.discount) ? `${priceData.discount.toFixed(2)}%` : "--"}
            loading={priceData.loading}
            variant={priceData.discount && priceData.discount < 0 ? "warning" : "default"}
          />
        </div>
      </section>
    </div>
  )
}
