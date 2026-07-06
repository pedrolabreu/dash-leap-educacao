import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pace de Vendas — LEAP",
  description: "Dashboard de pace de vendas por expert e período",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
