import { getContract } from "viem"
import { stPendleAbi } from "@/lib/abis/stPendle"
import { env } from "@/config/env"
import { publicClient } from "@/lib/viem"

export function getStPendleContract() {
  return getContract({
    address: env.stPendleAddress,
    abi: stPendleAbi,
    client: publicClient,
  })
}
