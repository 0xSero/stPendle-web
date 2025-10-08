import { useQuery } from "@tanstack/react-query"

import { env } from "@/config/env"
import { stPendleAbi } from "@/lib/abis/stPendle"
import { erc20Abi } from "@/lib/abis/erc20"
import { publicClient } from "@/lib/viem"

export function useVaultInfo() {
  return useQuery({
    queryKey: ["vault-info", env.stPendleAddress],
    queryFn: async () => {
      const assetAddress = (await publicClient.readContract({
        abi: stPendleAbi,
        address: env.stPendleAddress,
        functionName: "asset",
      })) as `0x${string}`

      const [symbol, decimals] = await Promise.all([
        publicClient.readContract({ address: assetAddress, abi: erc20Abi, functionName: "symbol" }),
        publicClient.readContract({ address: assetAddress, abi: erc20Abi, functionName: "decimals" }),
      ])

      return {
        assetAddress,
        symbol: (symbol as string) ?? "PENDLE",
        decimals: Number(decimals ?? 18n),
      }
    },
  })
}
