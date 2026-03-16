import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Explore Korea — Travel Guide for International Tourists",
  description:
    "Discover attractions, restaurants, hotels, and festivals across South Korea. Data-driven travel platform powered by Korea Tourism Organization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
