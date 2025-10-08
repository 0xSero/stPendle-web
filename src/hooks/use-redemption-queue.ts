import { useQuery } from "@tanstack/react-query"
import { formatUnits } from "viem"

import { STPENDLE_DECIMALS } from "@/config/constants"
import { env } from "@/config/env"
import { stPendleAbi } from "@/lib/abis/stPendle"
import { publicClient } from "@/lib/viem"

const baseCall = {
  address: env.stPendleAddress,
  abi: stPendleAbi,
} as const

async function fetchQueue(epoch?: number) {
  const [
    currentEpoch,
    totalRequestedShares,
    availableRedemption,
    totalAssets,
    totalSupply,
  ] = await Promise.all([
    publicClient.readContract({ ...baseCall, functionName: "getCurrentEpoch" }),
    publicClient.readContract({ ...baseCall, functionName: "totalRequestedRedemptionAmountPerEpoch", args: [BigInt(epoch ?? 0)] }),
    publicClient.readContract({ ...baseCall, functionName: "getAvailableRedemptionAmount" }),
    publicClient.readContract({ ...baseCall, functionName: "totalAssets" }),
    publicClient.readContract({ ...baseCall, functionName: "totalSupply" }),
  ])

  const epochNumber = Number(currentEpoch ?? 0n)
  const sharesQueued = parseFloat(
    formatUnits(totalRequestedShares as bigint, STPENDLE_DECIMALS)
  )
  const available = parseFloat(
    formatUnits(availableRedemption as bigint, STPENDLE_DECIMALS)
  )
  const nav = Number(formatUnits(totalAssets as bigint, STPENDLE_DECIMALS))
  const supply = Number(formatUnits(totalSupply as bigint, STPENDLE_DECIMALS))

  const navPerShare = supply ? nav / Math.max(supply, 1) : 0

  return {
    epoch: epochNumber,
    sharesQueued,
    available,
    navPerShare,
    estimatedPENDLENeeded: sharesQueued * navPerShare,
    estimatedEpochsToClear:
      available > 0 ? Math.ceil((sharesQueued * navPerShare) / Math.max(available, 1e-9)) : undefined,
  }
}

export function useRedemptionQueue(epoch?: number) {
  return useQuery({
    queryKey: ["redemption-queue", env.stPendleAddress, epoch, env.chainNetwork],
    queryFn: () => fetchQueue(epoch),
    refetchInterval: env.chainNetwork === "anvil" ? 10_000 : 60_000,
  })
}
