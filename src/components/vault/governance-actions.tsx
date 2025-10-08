"use client"

import * as React from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { AlertCircle, CheckCircle2, Loader2, Shield, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { env } from "@/config/env"
import { stPendleAbi } from "@/lib/abis/stPendle"

interface VoteEntry {
  pool: string
  weight: string
}

export function GovernanceActions() {
  const { address } = useAccount()
  const [feeReceiver, setFeeReceiver] = React.useState("")
  const [lpFeeReceiver, setLpFeeReceiver] = React.useState("")
  const [voteEntries, setVoteEntries] = React.useState<VoteEntry[]>([{ pool: "", weight: "" }])

  // Fee Receiver Updates
  const {
    writeContract: setFeeRec,
    data: feeRecHash,
    isPending: isFeeRecPending,
    error: feeRecError,
  } = useWriteContract()

  const { isLoading: isFeeRecConfirming, isSuccess: isFeeRecSuccess } = useWaitForTransactionReceipt({
    hash: feeRecHash,
  })

  // LP Fee Receiver Updates
  const {
    writeContract: setLpFeeRec,
    data: lpFeeRecHash,
    isPending: isLpFeeRecPending,
    error: lpFeeRecError,
  } = useWriteContract()

  const { isLoading: isLpFeeRecConfirming, isSuccess: isLpFeeRecSuccess } = useWaitForTransactionReceipt({
    hash: lpFeeRecHash,
  })

  // Voting
  const {
    writeContract: vote,
    data: voteHash,
    isPending: isVotePending,
    error: voteError,
  } = useWriteContract()

  const { isLoading: isVoteConfirming, isSuccess: isVoteSuccess } = useWaitForTransactionReceipt({
    hash: voteHash,
  })

  const handleSetFeeReceiver = React.useCallback(() => {
    if (!address || !feeReceiver) return
    setFeeRec({
      address: env.stPendleAddress as `0x${string}`,
      abi: stPendleAbi,
      functionName: "setFeeReceiver",
      args: [feeReceiver as `0x${string}`],
    })
  }, [address, feeReceiver, setFeeRec])

  const handleSetLpFeeReceiver = React.useCallback(() => {
    if (!address || !lpFeeReceiver) return
    setLpFeeRec({
      address: env.stPendleAddress as `0x${string}`,
      abi: stPendleAbi,
      functionName: "setLpFeeReceiver",
      args: [lpFeeReceiver as `0x${string}`],
    })
  }, [address, lpFeeReceiver, setLpFeeRec])

  const handleVote = React.useCallback(() => {
    if (!address) return

    // Filter out empty entries
    const validEntries = voteEntries.filter((e) => e.pool && e.weight)
    if (validEntries.length === 0) return

    const pools = validEntries.map((e) => e.pool as `0x${string}`)
    const weights = validEntries.map((e) => BigInt(e.weight))

    vote({
      address: env.stPendleAddress as `0x${string}`,
      abi: stPendleAbi,
      functionName: "vote",
      args: [pools, weights],
    })
  }, [address, voteEntries, vote])

  const addVoteEntry = React.useCallback(() => {
    setVoteEntries([...voteEntries, { pool: "", weight: "" }])
  }, [voteEntries])

  const removeVoteEntry = React.useCallback(
    (index: number) => {
      setVoteEntries(voteEntries.filter((_, i) => i !== index))
    },
    [voteEntries]
  )

  const updateVoteEntry = React.useCallback(
    (index: number, field: "pool" | "weight", value: string) => {
      const updated = [...voteEntries]
      updated[index][field] = value
      setVoteEntries(updated)
    },
    [voteEntries]
  )

  React.useEffect(() => {
    if (isFeeRecSuccess) setFeeReceiver("")
  }, [isFeeRecSuccess])

  React.useEffect(() => {
    if (isLpFeeRecSuccess) setLpFeeReceiver("")
  }, [isLpFeeRecSuccess])

  React.useEffect(() => {
    if (isVoteSuccess) setVoteEntries([{ pool: "", weight: "" }])
  }, [isVoteSuccess])

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Admin-Only Actions</AlertTitle>
        <AlertDescription>
          These functions require ADMIN_ROLE or TIMELOCK_CONTROLLER_ROLE. Unauthorized calls will revert.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="vote" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vote">Voting</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Voting Tab */}
        <TabsContent value="vote">
          <Card>
            <CardHeader>
              <CardTitle>Vote on Pools</CardTitle>
              <CardDescription>
                Cast governance votes on Pendle pools with weighted allocations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {voteEntries.map((entry, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>Pool Address</Label>
                    <Input
                      placeholder="0x..."
                      value={entry.pool}
                      onChange={(e) => updateVoteEntry(index, "pool", e.target.value)}
                      disabled={isVotePending || isVoteConfirming}
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Weight</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={entry.weight}
                      onChange={(e) => updateVoteEntry(index, "weight", e.target.value)}
                      disabled={isVotePending || isVoteConfirming}
                    />
                  </div>
                  {voteEntries.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-8"
                      onClick={() => removeVoteEntry(index)}
                      disabled={isVotePending || isVoteConfirming}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={addVoteEntry}
                disabled={isVotePending || isVoteConfirming}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Pool
              </Button>

              {voteError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{voteError.message.slice(0, 100)}</AlertDescription>
                </Alert>
              )}

              {isVoteSuccess && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>Vote submitted successfully!</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleVote}
                disabled={
                  !address ||
                  isVotePending ||
                  isVoteConfirming ||
                  voteEntries.every((e) => !e.pool || !e.weight)
                }
                className="w-full"
              >
                {(isVotePending || isVoteConfirming) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Vote
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Update Fee Receivers</CardTitle>
              <CardDescription>
                Configure the addresses that receive protocol and LP fees.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feeReceiver">Protocol Fee Receiver</Label>
                  <Input
                    id="feeReceiver"
                    placeholder="0x..."
                    value={feeReceiver}
                    onChange={(e) => setFeeReceiver(e.target.value)}
                    disabled={isFeeRecPending || isFeeRecConfirming}
                  />
                </div>

                {feeRecError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{feeRecError.message.slice(0, 100)}</AlertDescription>
                  </Alert>
                )}

                {isFeeRecSuccess && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>Fee receiver updated successfully!</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleSetFeeReceiver}
                  disabled={!address || !feeReceiver || isFeeRecPending || isFeeRecConfirming}
                  className="w-full"
                >
                  {(isFeeRecPending || isFeeRecConfirming) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Protocol Fee Receiver
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lpFeeReceiver">LP Fee Receiver</Label>
                  <Input
                    id="lpFeeReceiver"
                    placeholder="0x..."
                    value={lpFeeReceiver}
                    onChange={(e) => setLpFeeReceiver(e.target.value)}
                    disabled={isLpFeeRecPending || isLpFeeRecConfirming}
                  />
                </div>

                {lpFeeRecError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{lpFeeRecError.message.slice(0, 100)}</AlertDescription>
                  </Alert>
                )}

                {isLpFeeRecSuccess && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>LP fee receiver updated successfully!</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleSetLpFeeReceiver}
                  disabled={
                    !address || !lpFeeReceiver || isLpFeeRecPending || isLpFeeRecConfirming
                  }
                  className="w-full"
                >
                  {(isLpFeeRecPending || isLpFeeRecConfirming) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update LP Fee Receiver
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
