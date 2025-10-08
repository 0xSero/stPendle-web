import { useQuery } from "@tanstack/react-query"

import { env } from "@/config/env"
import { useVaultMetrics } from "@/hooks/use-vault-metrics"

async function fetchPendlePrice() {
  if (env.chainNetwork === "anvil") {
    return 1
  }

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${env.pendleCoingeckoId}&vs_currencies=usd`
  )
  if (!res.ok) throw new Error("Failed to fetch price")
  const data = await res.json()
  const usd = data?.[env.pendleCoingeckoId]?.usd as number | undefined
  if (!usd) throw new Error("Price unavailable")
  return usd
}

export function usePriceData() {
  const metrics = useVaultMetrics()
  const priceQuery = useQuery({
    queryKey: ["pendle-price", env.pendleCoingeckoId, env.chainNetwork],
    queryFn: fetchPendlePrice,
    refetchInterval: env.chainNetwork === "anvil" ? false : 60_000,
  })

  const nav = metrics.data?.navPerShare ?? 0
  const pendle = priceQuery.data ?? 0
  const navUsd = nav * pendle
  const discount = pendle ? ((navUsd - pendle) / pendle) * 100 : 0

  return {
    navUsd,
    pendlePrice: pendle,
    discount,
    loading: metrics.isLoading || priceQuery.isLoading,
    error: metrics.error || priceQuery.error,
  }
}
