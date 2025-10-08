"use client"

import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"

import { env } from "@/config/env"
import { wagmiConfig } from "@/lib/wagmi"

const queryClient = new QueryClient()

const rainbowConfig = getDefaultConfig({
  appName: env.appName,
  projectId: env.walletConnectProjectId || "stpendle-dashboard",
  chains: wagmiConfig.chains,
  ssr: true,
})

type ProvidersProps = {
  children: React.ReactNode
}

export function Web3Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig ?? rainbowConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
