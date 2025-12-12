import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leme | Análise Financeira Inteligente",
  description:
    "Transforme seus dados financeiros em diagnóstico completo, indicadores de saúde e plano de ação personalizado — tudo em minutos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
