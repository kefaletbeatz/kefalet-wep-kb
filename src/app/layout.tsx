import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kefalet Store",
  description: "Tek lisanslı beat ve remix mağazası"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
