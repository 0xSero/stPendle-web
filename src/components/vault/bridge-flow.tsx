"use client"

import * as React from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { parseUnits, formatUnits } from "viem"
import { AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserBalances } from "@/hooks/use-user-balances"
import { stPendleAbi } from "@/lib/abis/stPendle"
import { env } from "@/config/env"

// Common chain selectors for CCIP
const SUPPORTED_CHAINS = [
  { id: "16015286601757825753", name: "Ethereum Sepolia" },
  { id: "14767482510784806043", name: "Arbitrum Sepolia" },
  { id: "5224473277236331295", name: "Optimism Sepolia" },
  { id: "13264668187771770619", name: "Polygon Amoy" },
  { id: "3734403246176062136", name: "Base Sepolia" },
]

export function BridgeFlow() {
  const { address } = useAccount()
  const [amount, setAmount] = React.useState("")
  const [receiver, setReceiver] = React.useState("")
  const [destChainId, setDestChainId] = React.useState("")

  const balances = useUserBalances(address)

  // Read fee token
  const { data: feeToken } = useReadContract({
    address: env.stPendleAddress as `0x${string}`,
    abi: stPendleAbi,
    functionName: "feeToken",
  })

  const {
    writeContract: bridge,
    data: bridgeHash,
    isPending: isBridgePending,
    error: bridgeError,
  } = useWriteContract()

  const { isLoading: isBridgeConfirming, isSuccess: isBridgeSuccess } = useWaitForTransactionReceipt({
    hash: bridgeHash,
  })

  const parsedAmount = React.useMemo(() => {
    try {
      return amount ? parseUnits(amount, 18) : 0n
    } catch {
      return 0n
    }
  }, [amount])

  const handleBridge = React.useCallback(() => {
    if (!address || !destChainId || !receiver) return

    bridge({
      address: env.stPendleAddress as `0x${string}`,
      abi: stPendleAbi,
      functionName: "bridgeStPendle",
      args: [BigInt(destChainId), receiver as `0x${string}`, parsedAmount],
    })
  }, [address, destChainId, receiver, parsedAmount, bridge])

  const handleMaxAmount = React.useCallback(() => {
    if (balances.data?.stPendleBalance) {
      setAmount(formatUnits(BigInt(Math.floor(balances.data.stPendleBalance * 1e18)), 18))
    }
  }, [balances.data?.stPendleBalance])

  const canBridge = React.useMemo(() => {
    return (
      address &&
      parsedAmount > 0n &&
      destChainId &&
      receiver &&
      !isBridgePending &&
      !isBridgeConfirming &&
      balances.data?.stPendleBalance &&
      Number(amount) <= balances.data.stPendleBalance
    )
  }, [address, parsedAmount, destChainId, receiver, isBridgePending, isBridgeConfirming, balances.data?.stPendleBalance, amount])

  React.useEffect(() => {
    if (isBridgeSuccess) {
      setAmount("")
      setReceiver("")
      setDestChainId("")
    }
  }, [isBridgeSuccess])

  React.useEffect(() => {
    // Auto-populate receiver with connected address
    if (address && !receiver) {
      setReceiver(address)
    }
  }, [address, receiver])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bridge stPENDLE</CardTitle>
          <CardDescription>
            Transfer your stPENDLE tokens to another chain using Chainlink CCIP.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Cross-Chain Transfer</AlertTitle>
            <AlertDescription>
              Bridging locks your stPENDLE on this chain and releases it on the destination chain.
              Make sure the destination chain has a configured gateway.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (stPENDLE)</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isBridgePending || isBridgeConfirming}
              />
              <Button
                variant="outline"
                onClick={handleMaxAmount}
                disabled={!balances.data?.stPendleBalance}
              >
                MAX
              </Button>
            </div>
            {balances.data?.stPendleBalance && (
              <p className="text-sm text-muted-foreground">
                Balance: {balances.data.stPendleBalance.toFixed(4)} stPENDLE
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="destChain">Destination Chain</Label>
            <Select value={destChainId} onValueChange={setDestChainId}>
              <SelectTrigger id="destChain">
                <SelectValue placeholder="Select destination chain" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAINS.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select the chain you want to bridge to
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiver">Receiver Address</Label>
            <Input
              id="receiver"
              type="text"
              placeholder="0x..."
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              disabled={isBridgePending || isBridgeConfirming}
            />
            <p className="text-sm text-muted-foreground">
              Address that will receive stPENDLE on the destination chain
            </p>
          </div>

          {parsedAmount > 0n && destChainId && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bridge Route</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Current Chain</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-medium">
                    {SUPPORTED_CHAINS.find((c) => c.id === destChainId)?.name || "Unknown"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount to Bridge</span>
                <span className="font-medium">{amount} stPENDLE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee Token</span>
                <span>{feeToken === "0x0000000000000000000000000000000000000000" ? "Native (ETH)" : "ERC20"}</span>
              </div>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important Notes</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                <li>CCIP fees are paid in addition to gas fees</li>
                <li>Bridge transactions may take several minutes</li>
                <li>Ensure the destination chain has an active gateway</li>
                <li>Double-check the receiver address</li>
              </ul>
            </AlertDescription>
          </Alert>

          {bridgeError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {bridgeError.message.slice(0, 150)}
              </AlertDescription>
            </Alert>
          )}

          {isBridgeSuccess && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Bridge transaction submitted! Your stPENDLE will arrive on the destination chain shortly.
                <br />
                <span className="text-xs">Transaction hash: {bridgeHash}</span>
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleBridge}
            disabled={!canBridge}
            className="w-full"
          >
            {(isBridgePending || isBridgeConfirming) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Bridge to Destination
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}