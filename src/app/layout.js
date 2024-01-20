"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { WagmiConfig, createConfig, configureChains, sepolia } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { SessionProvider } from "next-auth/react";
const inter = Inter({ subsets: ["latin"] });

const { publicClient, webSocketPublicClient } = configureChains(
  [sepolia],
  [publicProvider()]
);
const config = createConfig({
  publicClient,
  webSocketPublicClient,
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <WagmiConfig config={config}>
        <SessionProvider >
          <body className={inter.className}>{children}</body>
        </SessionProvider>
      </WagmiConfig>
    </html>
  );
}
