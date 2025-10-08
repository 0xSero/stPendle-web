"use client"

import * as React from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { stPendleAbi } from "@/lib/abis/stPendle"
import { env } from "@/config/env"

export function FeesFlow() {
  const { address } = useAccount()
  const [totalAccrued, setTotalAccrued] = React.useState("")
  const [proofInput, setProofInput] = React.useState("")

  const {
    writeContract: claimFees,
    data: claimHash,
    isPending: isClaimPending,
    error: claimError,
  } = useWriteContract()

  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  })

  const parsedProof = React.useMemo(() => {
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(proofInput)
      if (Array.isArray(parsed)) {
        return parsed as `0x${string}`[]
      }
      return []
    } catch {
      // Try to parse as comma-separated hex strings
      if (proofInput.includes(",")) {
        return proofInput.split(",").map((s) => s.trim() as `0x${string}`)
      }
      return []
    }
  }, [proofInput])

  const handleClaimFees = React.useCallback(() => {
    if (!address || !totalAccrued || parsedProof.length === 0) return

    try {
      const totalAccruedBigInt = BigInt(totalAccrued)
      claimFees({
        address: env.stPendleAddress as `0x${string}`,
        abi: stPendleAbi,
        functionName: "claimFees",
        args: [totalAccruedBigInt, parsedProof],
      })
    } catch (err) {
      console.error("Error claiming fees:", err)
    }
  }, [address, totalAccrued, parsedProof, claimFees])

  const canClaim = React.useMemo(() => {
    return (
      address &&
      totalAccrued &&
      parsedProof.length > 0 &&
      !isClaimPending &&
      !isClaimConfirming
    )
  }, [address, totalAccrued, parsedProof, isClaimPending, isClaimConfirming])

  React.useEffect(() => {
    if (isClaimSuccess) {
      setTotalAccrued("")
      setProofInput("")
    }
  }, [isClaimSuccess])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Claim Vault Fees</CardTitle>
          <CardDescription>
            Anyone can call this function to claim accrued fees from the Pendle Merkle Distributor.
            Fees are automatically split between holders, LP providers, and protocol.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Public Function</AlertTitle>
            <AlertDescription>
              This is a public function that benefits the entire vault. When called, it:
              <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                <li>Claims PENDLE rewards from the Merkle Distributor</li>
                <li>Distributes to holders ({((9e17 / 1e18) * 100).toFixed(0)}%), LP ({((1e17 / 1e18) * 100).toFixed(0)}%), and protocol</li>
                <li>Automatically locks holder rewards in vePENDLE</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="totalAccrued">Total Accrued (wei)</Label>
            <Input
              id="totalAccrued"
              type="text"
              placeholder="1000000000000000000"
              value={totalAccrued}
              onChange={(e) => setTotalAccrued(e.target.value)}
              disabled={isClaimPending || isClaimConfirming}
            />
            <p className="text-sm text-muted-foreground">
              Total accrued amount in wei (1 PENDLE = 10^18 wei)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">Merkle Proof</Label>
            <Textarea
              id="proof"
              placeholder='["0x...", "0x...", "0x..."] or 0x..., 0x..., 0x...'
              value={proofInput}
              onChange={(e) => setProofInput(e.target.value)}
              disabled={isClaimPending || isClaimConfirming}
              rows={6}
              className="font-mono text-xs"
            />
            <p className="text-sm text-muted-foreground">
              Provide merkle proof as JSON array or comma-separated hex strings
            </p>
            {parsedProof.length > 0 && (
              <p className="text-sm text-green-600">
                ✓ Parsed {parsedProof.length} proof element(s)
              </p>
            )}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>How to Get Proof Data</AlertTitle>
            <AlertDescription>
              <ol className="mt-2 ml-4 list-decimal space-y-1 text-sm">
                <li>Visit the Pendle Merkle Distributor interface or API</li>
                <li>Query the current merkle root for the vault address</li>
                <li>Generate the merkle proof for the total accrued amount</li>
                <li>Paste the proof and amount here</li>
              </ol>
              <p className="mt-2 text-xs">
                The contract will verify the proof and revert if it&apos;s invalid.
              </p>
            </AlertDescription>
          </Alert>

          {claimError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {claimError.message.slice(0, 150)}
              </AlertDescription>
            </Alert>
          )}

          {isClaimSuccess && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Fees claimed successfully! Rewards have been distributed and locked.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleClaimFees}
            disabled={!canClaim}
            className="w-full"
          >
            {(isClaimPending || isClaimConfirming) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Claim Fees
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Gas fees will be paid by the caller. This action benefits all stPENDLE holders.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}