"use client"

import * as React from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { parseUnits, formatUnits } from "viem"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUserBalances } from "@/hooks/use-user-balances"
import { useVaultMetrics } from "@/hooks/use-vault-metrics"
import { stPendleAbi } from "@/lib/abis/stPendle"
import { erc20Abi } from "@/lib/abis/erc20"
import { env } from "@/config/env"

export function DepositFlow() {
  const { address } = useAccount()
  const [amount, setAmount] = React.useState("")
  const [receiver, setReceiver] = React.useState("")

  const balances = useUserBalances(address)
  const metrics = useVaultMetrics()

  const isBeforeFirstEpoch = metrics.data?.currentEpoch === 0

  // Read allowance
  const { data: allowance } = useReadContract({
    address: env.pendleTokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, env.stPendleAddress as `0x${string}`] : undefined,
  })

  // Approve contract
  const {
    writeContract: approve,
    data: approveHash,
    isPending: isApprovePending,
  } = useWriteContract()

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  // Deposit contract
  const {
    writeContract: deposit,
    data: depositHash,
    isPending: isDepositPending,
    error: depositError,
  } = useWriteContract()

  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash,
  })

  const parsedAmount = React.useMemo(() => {
    try {
      return amount ? parseUnits(amount, 18) : 0n
    } catch {
      return 0n
    }
  }, [amount])

  const needsApproval = React.useMemo(() => {
    if (!allowance || parsedAmount === 0n) return false
    return allowance < parsedAmount
  }, [allowance, parsedAmount])

  const handleApprove = React.useCallback(() => {
    if (!address) return
    approve({
      address: env.pendleTokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [env.stPendleAddress as `0x${string}`, parsedAmount],
    })
  }, [address, approve, parsedAmount])

  const handleDeposit = React.useCallback(() => {
    if (!address) return
    const receiverAddress = (receiver || address) as `0x${string}`

    if (isBeforeFirstEpoch) {
      deposit({
        address: env.stPendleAddress as `0x${string}`,
        abi: stPendleAbi,
        functionName: "depositBeforeFirstEpoch",
        args: [parsedAmount, receiverAddress],
      })
    } else {
      deposit({
        address: env.stPendleAddress as `0x${string}`,
        abi: stPendleAbi,
        functionName: "deposit",
        args: [parsedAmount, receiverAddress],
      })
    }
  }, [address, receiver, deposit, parsedAmount, isBeforeFirstEpoch])

  const handleMaxAmount = React.useCallback(() => {
    if (balances.data?.pendleBalance) {
      setAmount(formatUnits(BigInt(Math.floor(balances.data.pendleBalance * 1e18)), 18))
    }
  }, [balances.data?.pendleBalance])

  const canDeposit = React.useMemo(() => {
    return (
      address &&
      parsedAmount > 0n &&
      !needsApproval &&
      !isDepositPending &&
      !isDepositConfirming &&
      balances.data?.pendleBalance &&
      Number(amount) <= balances.data.pendleBalance
    )
  }, [address, parsedAmount, needsApproval, isDepositPending, isDepositConfirming, balances.data?.pendleBalance, amount])

  React.useEffect(() => {
    if (isDepositSuccess) {
      setAmount("")
      setReceiver("")
    }
  }, [isDepositSuccess])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deposit PENDLE</CardTitle>
          <CardDescription>
            {isBeforeFirstEpoch
              ? "Deposit PENDLE before the first epoch begins. Shares will be minted 1:1."
              : "Deposit PENDLE to receive stPENDLE shares. Assets are immediately locked in vePENDLE."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isBeforeFirstEpoch && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The first epoch has not started yet. Deposits will be locked when the admin starts the first epoch.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (PENDLE)</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isDepositPending || isDepositConfirming}
              />
              <Button
                variant="outline"
                onClick={handleMaxAmount}
                disabled={!balances.data?.pendleBalance}
              >
                MAX
              </Button>
            </div>
            {balances.data?.pendleBalance && (
              <p className="text-sm text-muted-foreground">
                Balance: {balances.data.pendleBalance.toFixed(4)} PENDLE
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiver">Receiver Address (optional)</Label>
            <Input
              id="receiver"
              type="text"
              placeholder={address || "0x..."}
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              disabled={isDepositPending || isDepositConfirming}
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to receive stPENDLE in your wallet
            </p>
          </div>

          {metrics.data && parsedAmount > 0n && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You will receive</span>
                <span className="font-medium">
                  ~{(Number(amount) / (metrics.data.navPerShare || 1)).toFixed(4)} stPENDLE
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current NAV</span>
                <span>{metrics.data.navPerShare?.toFixed(4)} PENDLE per share</span>
              </div>
            </div>
          )}

          {depositError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {depositError.message.slice(0, 100)}
              </AlertDescription>
            </Alert>
          )}

          {isDepositSuccess && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Deposit successful! Your stPENDLE shares have been minted.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {needsApproval ? (
              <Button
                onClick={handleApprove}
                disabled={isApprovePending || isApproveConfirming || !address}
                className="w-full"
              >
                {(isApprovePending || isApproveConfirming) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isApproveSuccess ? "Approved" : "Approve PENDLE"}
              </Button>
            ) : (
              <Button
                onClick={handleDeposit}
                disabled={!canDeposit}
                className="w-full"
              >
                {(isDepositPending || isDepositConfirming) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Deposit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}