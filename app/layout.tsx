import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "HonorPay — Gestión de Boletas de Honorarios",
  description: "Automatiza el flujo de boletas de honorarios para eventos en Chile. Emite, paga y declara F29 en un solo lugar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
