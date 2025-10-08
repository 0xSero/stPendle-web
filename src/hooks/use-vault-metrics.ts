import { useQuery } from "@tanstack/react-query"
import { formatUnits } from "viem"

import { STPENDLE_DECIMALS } from "@/config/constants"
import { env } from "@/config/env"
import { publicClient } from "@/lib/viem"
import { stPendleAbi } from "@/lib/abis/stPendle"

const baseCall = {
  address: env.stPendleAddress,
  abi: stPendleAbi,
} as const

export function useVaultMetrics() {
  return useQuery({
    queryKey: ["vault-metrics", env.stPendleAddress, env.chainNetwork],
    queryFn: async () => {
      const [
        totalAssets,
        totalLockedPendle,
        totalSupply,
        currentEpoch,
        epochDuration,
        currentEpochStart,
        preLockRedemptionPeriod,
      ] = await Promise.all([
        publicClient.readContract({ ...baseCall, functionName: "totalAssets" }),
        publicClient.readContract({ ...baseCall, functionName: "totalLockedPendle" }),
        publicClient.readContract({ ...baseCall, functionName: "totalSupply" }),
        publicClient.readContract({ ...baseCall, functionName: "getCurrentEpoch" }),
        publicClient.readContract({ ...baseCall, functionName: "epochDuration" }),
        publicClient.readContract({ ...baseCall, functionName: "currentEpochStart" }),
        publicClient.readContract({ ...baseCall, functionName: "preLockRedemptionPeriod" }),
      ])

      const formatted = {
        totalAssets: parseFloat(formatUnits(totalAssets as bigint, STPENDLE_DECIMALS)),
        totalLockedPendle: parseFloat(
          formatUnits(totalLockedPendle as bigint, STPENDLE_DECIMALS)
        ),
        totalSupply: parseFloat(formatUnits(totalSupply as bigint, STPENDLE_DECIMALS)),
        currentEpoch: Number(currentEpoch),
        lastEpochUpdate: 0,
        epochDuration: Number(epochDuration),
        currentEpochStart: Number(currentEpochStart),
        preLockRedemptionPeriod: Number(preLockRedemptionPeriod),
      }

      const navPerShare = formatted.totalSupply
        ? formatted.totalAssets / Math.max(formatted.totalSupply, 1)
        : 0

      return {
        ...formatted,
        navPerShare,
      }
    },
    refetchInterval: env.chainNetwork === "anvil" ? 5_000 : 30_000,
  })
}
