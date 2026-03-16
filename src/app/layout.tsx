import type { Metadata } from "next";
import Link from "next/link";
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
        {/* Header */}
        <header className="border-b">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold">
              Explore Korea
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/en/seoul" className="text-muted-foreground hover:text-foreground">
                Seoul
              </Link>
              <Link href="/en/busan" className="text-muted-foreground hover:text-foreground">
                Busan
              </Link>
              <Link href="/en/jeju" className="text-muted-foreground hover:text-foreground">
                Jeju
              </Link>
            </div>
          </nav>
        </header>

        {children}

        {/* Footer */}
        <footer className="border-t px-4 py-8 text-center">
          <p className="text-muted-foreground text-sm">
            Data powered by Korea Tourism Organization TourAPI
          </p>
        </footer>
      </body>
    </html>
  );
}
