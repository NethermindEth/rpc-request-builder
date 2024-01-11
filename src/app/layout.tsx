import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Starknet JSON-RPC Request Builder",
  description: `An interactive web tool designed for developers working with Starknet. This app simplifies the process of creating and testing JSON-RPC requests on Starknet. Users can easily construct, modify, and send requests using Nethermind's free RPC Service.`,
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
