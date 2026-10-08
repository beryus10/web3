import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "alphainfortrading | Move money with confidence",
  description: "alphainfortrading gives you one clear place to convert tokens, save smarter, manage your wallet, and send digital value globally.",
  keywords: ["digital finance", "crypto wallet", "token conversion", "web3 savings", "digital asset platform"],
  openGraph: { title: "alphainfortrading | Move money with confidence", description: "Clearer, faster digital finance for your next move.", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
