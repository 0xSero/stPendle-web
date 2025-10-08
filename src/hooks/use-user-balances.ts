import { useQuery } from "@tanstack/react-query"
import { formatUnits } from "viem"

import { STPENDLE_DECIMALS } from "@/config/constants"
import { env } from "@/config/env"
import { stPendleAbi } from "@/lib/abis/stPendle"
import { erc20Abi } from "@/lib/abis/erc20"
import { publicClient } from "@/lib/viem"

const baseVault = {
  address: env.stPendleAddress,
  abi: stPendleAbi,
} as const

async function fetchUserBalances(address?: `0x${string}`) {
  if (!address) return null

  const [stPendleBalance, pendleAddress, userRequestedShares] = await Promise.all([
    publicClient.readContract({ ...baseVault, functionName: "balanceOf", args: [address] }),
    publicClient.readContract({ ...baseVault, functionName: "asset" }),
    publicClient.readContract({ ...baseVault, functionName: "getUserAvailableRedemption", args: [address] }),
  ])

  const pendleAssetAddress = pendleAddress as `0x${string}`

  const [pendleBalance, pendleDecimals] = await Promise.all([
    publicClient.readContract({
      address: pendleAssetAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    }),
    publicClient.readContract({
      address: pendleAssetAddress,
      abi: erc20Abi,
      functionName: "decimals",
    }),
  ])

  const decimals = Number(pendleDecimals ?? 18n)

  return {
    stPendleBalance: parseFloat(
      formatUnits(stPendleBalance as bigint, STPENDLE_DECIMALS)
    ),
    pendleBalance: parseFloat(formatUnits(pendleBalance as bigint, decimals)),
    requestedRedemptionShares: parseFloat(
      formatUnits(userRequestedShares as bigint, STPENDLE_DECIMALS)
    ),
    pendleAssetAddress,
    pendleDecimals: decimals,
  }
}

export function useUserBalances(address?: `0x${string}`) {
  return useQuery({
    queryKey: ["user-balances", address, env.stPendleAddress, env.chainNetwork],
    queryFn: () => fetchUserBalances(address),
    enabled: Boolean(address),
    refetchInterval: env.chainNetwork === "anvil" ? 5_000 : 15_000,
  })
}
