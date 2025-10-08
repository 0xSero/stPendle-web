"use client"

import * as React from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { env } from "@/config/env"

const sections = [
  {
    label: "Overview",
    items: [
      { key: "dashboard", label: "Dashboard" },
      { key: "vault-stats", label: "Vault Stats" },
      { key: "withdrawals", label: "Withdrawal Queue" },
      { key: "governance", label: "Governance" },
    ],
  },
  {
    label: "Actions",
    items: [
      { key: "deposit", label: "Deposit" },
      { key: "redeem", label: "Request Redemption" },
      { key: "fees", label: "Fees" },
      { key: "bridge", label: "Bridge" },
    ],
  },
]

export function Web3Shell({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeKey, setActiveKey] = React.useState("dashboard")

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border/80">
        <SidebarHeader className="gap-3 p-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {env.appName}
            </span>
            <h1 className="text-xl font-semibold tracking-tight">
              stPENDLE Vault
            </h1>
          </div>
          <ConnectButton.Custom>
            {({ mounted, openConnectModal, account, chain, authenticationStatus }) => {
              const ready = mounted && authenticationStatus !== "loading"
              const connected =
                ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated")

              return (
                <div className="flex items-center gap-2">
                  <Button
                    variant={connected ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (!connected) openConnectModal()
                    }}
                  >
                    {connected ? account.displayName : "Connect Wallet"}
                  </Button>
                  {connected && (
                    <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {chain.name}
                    </span>
                  )}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </SidebarHeader>
        <SidebarContent>
          {sections.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={activeKey === item.key}
                      onClick={() => setActiveKey(item.key)}
                    >
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
              <SidebarSeparator />
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold">{sections.flatMap((s) => s.items).find((x) => x.key === activeKey)?.label}</h2>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <Card className="border-border/50 bg-card/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">
                {sections.flatMap((s) => s.items).find((x) => x.key === activeKey)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {children}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
