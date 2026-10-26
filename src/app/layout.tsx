import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Proveedores } from "@/components/Proveedores";

// Archivo variable (ejes wdth 62–125 y wght 100–900), servida desde la app: anda sin señal.
const archivo = localFont({
  src: "../fuentes/archivo-latin-wdth.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Playbook",
  description: "Contás cuántos vinieron y Playbook te arma el entrenamiento de hockey, con la pizarra animada.",
  applicationName: "Playbook",
  appleWebApp: { capable: true, title: "Playbook", statusBarStyle: "black-translucent" },
  icons: { apple: "/iconos/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#070b12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" data-tema="oscuro" className={`${archivo.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <Proveedores>{children}</Proveedores>
        <Analytics />
      </body>
    </html>
  );
}
