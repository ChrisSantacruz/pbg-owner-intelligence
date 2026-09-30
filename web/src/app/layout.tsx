import type { Metadata, Viewport } from "next";
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
    "Entiende qué está pasando de verdad en tu agencia: conversaciones reales, citas y ventas.",
  applicationName: "Pulse",
  appleWebApp: {
    capable: true,
    title: "Pulse",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07131c",
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
