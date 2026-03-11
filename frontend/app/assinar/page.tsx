"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://leme-production.up.railway.app";

const beneficios = [
  { icone: "📊", titulo: "8 indicadores financeiros completos", descricao: "Visão total da saúde do seu negócio" },
  { icone: "🤖", titulo: "Chat com IA consultora", descricao: "Tire dúvidas com base nos seus próprios dados" },
  { icone: "📈", titulo: "Histórico e evolução do score", descricao: "Acompanhe sua melhora mês a mês" },
  { icone: "⚡", titulo: "Simulador de cenários", descricao: "Simule decisões antes de tomar" },
  { icone: "🏢", titulo: "Comparativo setorial com IA", descricao: "Veja como você se compara ao seu setor" },
  { icone: "📧", titulo: "Alertas mensais automáticos", descricao: "Resumo executivo direto no seu e-mail" },
];

export default function AssinarPage() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleAssinar() {
    setErro("");
    setCarregando(true);

    try {
      const res = await fetch(`${API_URL}/stripe-pro/criar-checkout`, {
        method: "POST",
        credentials: "include", // envia o cookie de autenticação
      });

      if (res.status === 401) {
        // Não está logado — manda para cadastro
        window.location.href = "/cadastro";
        return;
      }

      if (res.status === 400) {
        const dados = await res.json();
        setErro(dados.detail || "Erro ao iniciar assinatura.");
        setCarregando(false);
        return;
      }

      if (res.ok) {
        const dados = await res.json();
        // Redireciona para o Stripe Checkout
        window.location.href = dados.checkout_url;
      } else {
        setErro("Erro ao processar. Tente novamente.");
        setCarregando(false);
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
        fontFamily: "'Montserrat', sans-serif",
        padding: "40px 16px",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');`}</style>

      <div style={{ maxWidth: "560px", margin: "0 auto" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "40px", height: "40px",
                backgroundColor: "#112d4e", borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="white"/>
                </svg>
              </div>
              <span style={{ fontSize: "22px", fontWeight: "700", color: "#112d4e" }}>Leme</span>
            </div>
          </Link>
        </div>

        {/* Hero */}
        <div style={{
          backgroundColor: "#112d4e",
          borderRadius: "20px",
          padding: "40px 32px",
          textAlign: "center",
          marginBottom: "24px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Detalhe decorativo */}
          <div style={{
            position: "absolute", top: "-30px", right: "-30px",
            width: "120px", height: "120px",
            backgroundColor: "#00c894",
            borderRadius: "50%",
            opacity: 0.1,
          }} />

          <div style={{
            display: "inline-block",
            backgroundColor: "#00c894",
            color: "#112d4e",
            fontSize: "12px",
            fontWeight: "700",
            padding: "4px 12px",
            borderRadius: "20px",
            marginBottom: "16px",
            letterSpacing: "0.5px",
          }}>
            LEME PRO
          </div>

          <h1 style={{
            color: "#ffffff",
            fontSize: "28px",
            fontWeight: "800",
            margin: "0 0 12px 0",
            lineHeight: "1.3",
          }}>
            Acompanhamento financeiro{" "}
            <span style={{ color: "#00c894" }}>completo</span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "15px",
            margin: "0 0 32px 0",
            lineHeight: "1.6",
          }}>
            Tudo que seu negócio precisa para crescer com clareza — IA, histórico, alertas e muito mais.
          </p>

          {/* Preço */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px" }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px" }}>R$</span>
              <span style={{ color: "#ffffff", fontSize: "52px", fontWeight: "800", lineHeight: "1" }}>97</span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px" }}>/mês</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: "6px 0 0 0" }}>
              Cancele quando quiser
            </p>
          </div>

          {/* Erro */}
          {erro && (
            <div style={{
              backgroundColor: "rgba(255,100,100,0.15)",
              border: "1px solid rgba(255,100,100,0.4)",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
              color: "#ffaaaa",
              fontSize: "14px",
            }}>
              {erro}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleAssinar}
            disabled={carregando}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: carregando ? "#ccc" : "#f5793b",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "700",
              fontFamily: "'Montserrat', sans-serif",
              cursor: carregando ? "not-allowed" : "pointer",
              transition: "background-color 0.2s, transform 0.1s",
            }}
            onMouseOver={(e) => !carregando && ((e.target as HTMLButtonElement).style.backgroundColor = "#e8682e")}
            onMouseOut={(e) => !carregando && ((e.target as HTMLButtonElement).style.backgroundColor = "#f5793b")}
          >
            {carregando ? "Aguarde..." : "Assinar agora →"}
          </button>

          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "12px" }}>
            🔒 Pagamento seguro via Stripe
          </p>
        </div>

        {/* Benefícios */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "28px 28px",
          boxShadow: "0 4px 24px rgba(17, 45, 78, 0.06)",
          marginBottom: "24px",
        }}>
          <h2 style={{
            fontSize: "16px", fontWeight: "700", color: "#112d4e",
            margin: "0 0 20px 0",
          }}>
            O que está incluído no Pro:
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {beneficios.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "1px" }}>{b.icone}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#112d4e" }}>{b.titulo}</div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>{b.descricao}</div>
                </div>
                <span style={{ marginLeft: "auto", color: "#00c894", flexShrink: 0 }}>✓</span>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div style={{ textAlign: "center" }}>
          <Link href="/login" style={{ fontSize: "14px", color: "#666", textDecoration: "none" }}>
            Já tenho conta →{" "}
            <span style={{ color: "#f5793b", fontWeight: "600" }}>Entrar</span>
          </Link>
        </div>
        <p style={{ textAlign: "center", marginTop: "12px" }}>
          <Link href="/" style={{ fontSize: "13px", color: "#999", textDecoration: "none" }}>
            ← Voltar ao início
          </Link>
        </p>
      </div>
    </div>
  );
}
