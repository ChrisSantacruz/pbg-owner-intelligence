import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dm = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Pulse · Inteligencia para el Dueño de Agencia",
  description:
    "MVP de inteligencia de agencia: métricas confiables, no solo lo que el carrier reporta.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${dm.variable} ${fraunces.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
