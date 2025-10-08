"use client"

import * as React from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RedemptionQueue } from "@/components/vault/redemption-queue"
import { VaultOverview } from "@/components/vault/vault-overview"
import { GovernanceActions } from "@/components/vault/governance-actions"
import { DepositFlow } from "@/components/vault/deposit-flow"
import { WithdrawFlow } from "@/components/vault/withdraw-flow"
import { FeesFlow } from "@/components/vault/fees-flow"
import { BridgeFlow } from "@/components/vault/bridge-flow"
import { env } from "@/config/env"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/80 bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {env.appName}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">
              Institutional Grade Liquid Staking
            </h1>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="bridge">Bridge</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <VaultOverview />
            <RedemptionQueue />
          </TabsContent>

          {/* Deposit Tab */}
          <TabsContent value="deposit">
            <Card>
              <CardHeader>
                <CardTitle>Deposit PENDLE</CardTitle>
              </CardHeader>
              <CardContent>
                <DepositFlow />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <WithdrawFlow />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle>Claim Vault Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <FeesFlow />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bridge Tab */}
          <TabsContent value="bridge">
            <Card>
              <CardHeader>
                <CardTitle>Cross-Chain Bridge</CardTitle>
              </CardHeader>
              <CardContent>
                <BridgeFlow />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance">
            <Card>
              <CardHeader>
                <CardTitle>Governance Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <GovernanceActions />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border/80 bg-card/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
            <p>© 2025 stPENDLE. Institutional grade vePENDLE liquid staking.</p>
            <div className="flex gap-4">
              <a href="https://www.pendle.finance/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                Website
              </a>
              <a href="https://app.pendle.finance/trade/markets" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                Markets
              </a>
              <a href={env.explorerUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                Explorer
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
