import { cookieStorage, createConfig, createStorage, http } from "wagmi"
import { mainnet } from "wagmi/chains"

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
  rpcUrls: {
    default: { http: [env.rpcUrl] },
    public: { http: [env.rpcUrl] },
  },
  blockExplorers: {
    default: { name: env.chainName, url: env.explorerUrl },
  },
}

export const wagmiConfig = createConfig({
  chains: [enabledChain],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [enabledChain.id]: http(env.rpcUrl),
  },
})
