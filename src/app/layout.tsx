import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "@rainbow-me/rainbowkit/styles.css"
import "./globals.css"

import { env } from "@/config/env"
import { ThemeProvider } from "@/providers/theme-provider"
import { Web3Providers } from "@/providers/wagmi-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: env.appName,
  description: "Institutional grade stPENDLE dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Web3Providers>{children}</Web3Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
