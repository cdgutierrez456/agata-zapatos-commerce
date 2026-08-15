import type { Metadata } from "next";
import { Bodoni_Moda, Jost, Petit_Formal_Script } from "next/font/google";
import "./globals.css";

// next/font las auto-hospeda: cero peticiones a Google en el navegador y sin
// salto de línea base al cargar. Solo exponen la variable CSS; quién las usa
// lo decide @theme en globals.css.
const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

const petit = Petit_Formal_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-petit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ágata — Calzado de mujer",
  description:
    "Tacones, sandalias y plataformas seleccionados pieza a pieza. Consulta disponibilidad y tallas por WhatsApp.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${jost.variable} ${bodoni.variable} ${petit.variable}`}>
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
