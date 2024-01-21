"use client";

import * as React from "react";
import { WagmiConfig, createConfig } from "wagmi";
import {
    ConnectKitProvider,
    getDefaultConfig,
} from "connectkit";
import { mainnet, polygon, polygonMumbai, sepolia } from "wagmi/chains";

const chains = [mainnet, polygon, polygonMumbai, sepolia];

const config = createConfig(
    getDefaultConfig({
        // Required API Keys
        alchemyId: process.env.ALCHEMY_ID, // or infuraId
        walletConnectProjectId: "85a616505f219621a73d1af8a208fd14",

        // Required
        appName: "Bankwim",

        chains,

        // Optional
        appDescription: "Your App Description",
        appUrl: "https://family.co", // your app's url
        appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
    })
);

export function Providers({ children }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    
    return (
        <WagmiConfig config={config}>
            <ConnectKitProvider>{mounted && children}</ConnectKitProvider>
        </WagmiConfig>
    );
}