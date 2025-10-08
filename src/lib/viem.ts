import { createPublicClient, createWalletClient, http } from "viem"
import { mainnet } from "viem/chains"

import { env } from "@/config/env"

const enabledChain = {
  ...mainnet,
  id: env.chainId,
  name: env.chainName,
  network: env.chainNetwork,
  nativeCurrency: {
    name: env.nativeSymbol,
    symbol: env.nativeSymbol,
    decimals: env.nativeDecimals,
  },
  contracts: {
    multicall3: undefined as any,
  },
}

export const publicClient = createPublicClient({
  chain: enabledChain,
  transport: http(env.rpcUrl, {
    batch: false,
    retryCount: 2,
  }),
  pollingInterval: 12_000,
})

export const walletClientFactory = () =>
  createWalletClient({
    chain: enabledChain,
    transport: http(env.rpcUrl),
  })
