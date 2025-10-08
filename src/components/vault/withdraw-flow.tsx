"use client"

import * as React from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseUnits, formatUnits } from "viem"
import { AlertCircle, CheckCircle2, Loader2, Clock } from "lucide-react"
import { formatDistanceStrict } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useUserBalances } from "@/hooks/use-user-balances"
import { useVaultMetrics } from "@/hooks/use-vault-metrics"
import { useRedemptionQueue } from "@/hooks/use-redemption-queue"
import { stPendleAbi } from "@/lib/abis/stPendle"
import { env } from "@/config/env"

export function WithdrawFlow() {
  const { address } = useAccount()
  const balances = useUserBalances(address)
  const metrics = useVaultMetrics()
  const queue = useRedemptionQueue(metrics.data?.currentEpoch)

  return (
    <Tabs defaultValue="request" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="request">Request Redemption</TabsTrigger>
        <TabsTrigger value="claim">Claim Redemption</TabsTrigger>
      </TabsList>

      <TabsContent value="request">
        <RequestRedemption
          address={address}
          balances={balances}
          metrics={metrics}
        />
      </TabsContent>

      <TabsContent value="claim">
        <ClaimRedemption
          address={address}
          balances={balances}
          metrics={metrics}
          queue={queue}
        />
      </TabsContent>
    </Tabs>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function RequestRedemption({
  address,
  balances,
  metrics,
}: {
  address: `0x${string}` | undefined
  balances: any
  metrics: any
}) {
  const [shares, setShares] = React.useState("")
  const [targetEpoch, setTargetEpoch] = React.useState("")

  const {
    writeContract: requestRedemption,
    data: requestHash,
    isPending: isRequestPending,
    error: requestError,
  } = useWriteContract()

  const { isLoading: isRequestConfirming, isSuccess: isRequestSuccess } = useWaitForTransactionReceipt({
    hash: requestHash,
  })

  const parsedShares = React.useMemo(() => {
    try {
      return shares ? parseUnits(shares, 18) : 0n
    } catch {
      return 0n
    }
  }, [shares])

  const parsedEpoch = React.useMemo(() => {
    try {
      return targetEpoch ? BigInt(targetEpoch) : 0n
    } catch {
      return 0n
    }
  }, [targetEpoch])

  const nextEpoch = React.useMemo(() => {
    return metrics.data?.currentEpoch ? metrics.data.currentEpoch + 1 : undefined
  }, [metrics.data?.currentEpoch])

  const estimatedPendleAmount = React.useMemo(() => {
    if (!metrics.data?.navPerShare || !shares) return 0
    return Number(shares) * metrics.data.navPerShare
  }, [metrics.data?.navPerShare, shares])

  const handleRequest = React.useCallback(() => {
    if (!address) return
    requestRedemption({
      address: env.stPendleAddress as `0x${string}`,
      abi: stPendleAbi,
      functionName: "requestRedemptionForEpoch",
      args: [parsedShares, parsedEpoch],
    })
  }, [address, requestRedemption, parsedShares, parsedEpoch])

  const handleMaxShares = React.useCallback(() => {
    if (balances.data?.stPendleBalance) {
      setShares(formatUnits(BigInt(Math.floor(balances.data.stPendleBalance * 1e18)), 18))
    }
  }, [balances.data?.stPendleBalance])

  const canRequest = React.useMemo(() => {
    return (
      address &&
      parsedShares > 0n &&
      !isRequestPending &&
      !isRequestConfirming &&
      balances.data?.stPendleBalance &&
      Number(shares) <= balances.data.stPendleBalance
    )
  }, [address, parsedShares, isRequestPending, isRequestConfirming, balances.data?.stPendleBalance, shares])

  React.useEffect(() => {
    if (isRequestSuccess) {
      setShares("")
      setTargetEpoch("")
    }
  }, [isRequestSuccess])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Redemption</CardTitle>
        <CardDescription>
          Queue your stPENDLE shares for redemption. You can claim during the redemption window of your target epoch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Epoch-Based Redemptions</AlertTitle>
          <AlertDescription>
            Redemptions are queued by epoch. You must wait until your target epoch begins, then claim during the
            redemption window (first {metrics.data?.preLockRedemptionPeriod ? (metrics.data.preLockRedemptionPeriod / 86400).toFixed(1) : '--'} days of the epoch).
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="shares">Shares (stPENDLE)</Label>
          <div className="flex gap-2">
            <Input
              id="shares"
              type="number"
              placeholder="0.00"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              disabled={isRequestPending || isRequestConfirming}
            />
            <Button
              variant="outline"
              onClick={handleMaxShares}
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
          <Label htmlFor="epoch">Target Epoch (optional)</Label>
          <Input
            id="epoch"
            type="number"
            placeholder={nextEpoch?.toString() || "Next epoch"}
            value={targetEpoch}
            onChange={(e) => setTargetEpoch(e.target.value)}
            disabled={isRequestPending || isRequestConfirming}
          />
          <p className="text-sm text-muted-foreground">
            Leave empty to queue for the next epoch ({nextEpoch})
          </p>
        </div>

        {estimatedPendleAmount > 0 && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated PENDLE</span>
              <span className="font-medium">~{estimatedPendleAmount.toFixed(4)} PENDLE</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current NAV</span>
              <span>{metrics.data?.navPerShare?.toFixed(4)} PENDLE per share</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Final amount depends on NAV at epoch start
            </p>
          </div>
        )}

        {requestError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {requestError.message.slice(0, 100)}
            </AlertDescription>
          </Alert>
        )}

        {isRequestSuccess && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Redemption request submitted! You can claim during the redemption window of epoch {parsedEpoch > 0n ? parsedEpoch.toString() : nextEpoch}.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleRequest}
          disabled={!canRequest}
          className="w-full"
        >
          {(isRequestPending || isRequestConfirming) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Request Redemption
        </Button>
      </CardContent>
    </Card>
  )
}

function ClaimRedemption({
  address,
  balances,
  metrics,
  queue,
}: {
  address: `0x${string}` | undefined
  balances: any
  metrics: any
  queue: any
}) {
  const [claimShares, setClaimShares] = React.useState("")

  const {
    writeContract: claimRedemption,
    data: claimHash,
    isPending: isClaimPending,
    error: claimError,
  } = useWriteContract()

  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  })

  const parsedClaimShares = React.useMemo(() => {
    try {
      return claimShares ? parseUnits(claimShares, 18) : 0n
    } catch {
      return 0n
    }
  }, [claimShares])

  const isWithinWindow = React.useMemo(() => {
    if (!metrics.data) return false
    const epochEnd = metrics.data.currentEpochStart + metrics.data.preLockRedemptionPeriod
    return Date.now() / 1000 < epochEnd
  }, [metrics.data])

  const windowTimeRemaining = React.useMemo(() => {
    if (!metrics.data || !isWithinWindow) return null
    const epochEnd = metrics.data.currentEpochStart + metrics.data.preLockRedemptionPeriod
    return formatDistanceStrict(Date.now(), epochEnd * 1000)
  }, [metrics.data, isWithinWindow])

  const availableRedemption = React.useMemo(() => {
    return balances.data?.requestedRedemptionShares || 0
  }, [balances.data?.requestedRedemptionShares])

  const handleClaim = React.useCallback(() => {
    if (!address) return
    claimRedemption({
      address: env.stPendleAddress as `0x${string}`,
      abi: stPendleAbi,
      functionName: "claimAvailableRedemptionShares",
      args: [parsedClaimShares],
    })
  }, [address, claimRedemption, parsedClaimShares])

  const handleMaxClaim = React.useCallback(() => {
    if (availableRedemption > 0) {
      setClaimShares(formatUnits(BigInt(Math.floor(availableRedemption * 1e18)), 18))
    }
  }, [availableRedemption])

  const canClaim = React.useMemo(() => {
    return (
      address &&
      parsedClaimShares > 0n &&
      !isClaimPending &&
      !isClaimConfirming &&
      isWithinWindow &&
      availableRedemption > 0 &&
      Number(claimShares) <= availableRedemption
    )
  }, [address, parsedClaimShares, isClaimPending, isClaimConfirming, isWithinWindow, availableRedemption, claimShares])

  React.useEffect(() => {
    if (isClaimSuccess) {
      setClaimShares("")
    }
  }, [isClaimSuccess])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claim Redemption</CardTitle>
        <CardDescription>
          Claim your queued redemptions during the active redemption window.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Redemption Window Status</p>
            <p className="text-xs text-muted-foreground">Current epoch: {metrics.data?.currentEpoch}</p>
          </div>
          <Badge variant={isWithinWindow ? "default" : "secondary"}>
            {isWithinWindow ? "Open" : "Closed"}
          </Badge>
        </div>

        {isWithinWindow && windowTimeRemaining && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Window closes in {windowTimeRemaining}
            </AlertDescription>
          </Alert>
        )}

        {!isWithinWindow && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The redemption window is currently closed. Claims can only be made during the first {metrics.data?.preLockRedemptionPeriod ? (metrics.data.preLockRedemptionPeriod / 86400).toFixed(1) : '--'} days of each epoch.
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available to Claim</span>
            <span className="font-medium">{availableRedemption.toFixed(4)} stPENDLE</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available PENDLE</span>
            <span>{queue.data?.available?.toFixed(4) || '--'} PENDLE</span>
          </div>
        </div>

        {availableRedemption > 0 && (
          <div className="space-y-2">
            <Label htmlFor="claimShares">Shares to Claim (stPENDLE)</Label>
            <div className="flex gap-2">
              <Input
                id="claimShares"
                type="number"
                placeholder="0.00"
                value={claimShares}
                onChange={(e) => setClaimShares(e.target.value)}
                disabled={isClaimPending || isClaimConfirming || !isWithinWindow}
              />
              <Button
                variant="outline"
                onClick={handleMaxClaim}
                disabled={!availableRedemption || !isWithinWindow}
              >
                MAX
              </Button>
            </div>
          </div>
        )}

        {claimError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {claimError.message.slice(0, 100)}
            </AlertDescription>
          </Alert>
        )}

        {isClaimSuccess && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Redemption claimed successfully! PENDLE has been sent to your wallet.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleClaim}
          disabled={!canClaim}
          className="w-full"
        >
          {(isClaimPending || isClaimConfirming) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Claim Redemption
        </Button>
      </CardContent>
    </Card>
  )
}