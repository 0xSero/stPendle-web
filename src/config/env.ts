export const env = {
  appName: "stPENDLE Vault",
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 1),
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME ?? "Ethereum Mainnet",
  chainNetwork: process.env.NEXT_PUBLIC_CHAIN_NETWORK ?? "mainnet",
  nativeSymbol: process.env.NEXT_PUBLIC_CHAIN_SYMBOL ?? "ETH",
  nativeDecimals: Number(process.env.NEXT_PUBLIC_CHAIN_DECIMALS ?? 18),
  explorerUrl: process.env.NEXT_PUBLIC_CHAIN_EXPLORER ?? "https://etherscan.io",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "https://mainnet.infura.io/v3/YOUR_KEY",
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  stPendleAddress: (process.env.NEXT_PUBLIC_STPENDLE_ADDRESS ??
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
  pendleTokenAddress: (process.env.NEXT_PUBLIC_PENDLE_ADDRESS ??
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
  pendleCoingeckoId:
    process.env.NEXT_PUBLIC_PENDLE_COINGECKO_ID ?? "pendle",
};
