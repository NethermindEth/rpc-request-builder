import "./globals.css";
import type { Metadata } from "next";

import { Exo } from "next/font/google";
const inter = Exo({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Starknet JSON-RPC Request Builder",
  description: `An interactive web tool designed for developers working with Starknet. This app simplifies the process of creating and testing JSON-RPC requests. Users can easily construct, modify, and send requests using Nethermind's free RPC Service.`,
  openGraph: {
    type: "website",
    locale: "en_UK",
    url: "https://rpc-request-builder.voyager.online/",
    siteName: "Starknet JSON-RPC Request Builder",
    images: [
      {
        url: "https://rpc-request-builder.voyager.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "Starknet JSON-RPC Request Builder",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
