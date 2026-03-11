"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://leme-production.up.railway.app";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro() {
    setErro("");

    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);

    try {
      // 1. Cria a conta
      const resRegister = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });

      if (!resRegister.ok) {
        const err = await resRegister.json();
        setErro(err.detail || "Erro ao criar conta.");
        setCarregando(false);
        return;
      }

      // 2. Faz login automaticamente após cadastro
      const resLogin = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, senha }),
      });

      if (resLogin.ok) {
        // Redireciona para a página de assinatura
        window.location.href = "/assinar";
      } else {
        // Conta criada mas login falhou — manda para login manual
        window.location.href = "/login";
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');`}</style>

      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "40px", height: "40px",
                backgroundColor: "#112d4e",
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="white"/>
                </svg>
              </div>
              <span style={{ fontSize: "22px", fontWeight: "700", color: "#112d4e" }}>Leme</span>
            </div>
          </Link>
          <p style={{ marginTop: "8px", color: "#666", fontSize: "14px" }}>
            Crie sua conta e comece hoje
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "36px 32px",
          boxShadow: "0 4px 24px rgba(17, 45, 78, 0.08)",
        }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#112d4e", margin: "0 0 24px 0" }}>
            Criar conta
          </h1>

          {erro && (
            <div style={{
              backgroundColor: "#fff5f5", border: "1px solid #ffcccc",
              borderRadius: "8px", padding: "12px 14px",
              marginBottom: "20px", color: "#c0392b", fontSize: "14px",
            }}>
              {erro}
            </div>
          )}

          {/* Nome */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#112d4e", marginBottom: "6px" }}>
              Nome <span style={{ color: "#999", fontWeight: "400" }}>(opcional)</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#112d4e")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
          </div>

          {/* E-mail */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#112d4e", marginBottom: "6px" }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#112d4e")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
          </div>

          {/* Senha */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#112d4e", marginBottom: "6px" }}>
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#112d4e")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
          </div>

          {/* Confirmar senha */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#112d4e", marginBottom: "6px" }}>
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repita a senha"
              onKeyDown={(e) => e.key === "Enter" && handleCadastro()}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#112d4e")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
          </div>

          <button
            onClick={handleCadastro}
            disabled={carregando || !email || !senha || !confirmar}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: carregando || !email || !senha || !confirmar ? "#ccc" : "#00c894",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "700",
              fontFamily: "'Montserrat', sans-serif",
              cursor: carregando || !email || !senha || !confirmar ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {carregando ? "Criando conta..." : "Criar conta grátis"}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ color: "#f5793b", fontWeight: "600", textDecoration: "none" }}>
            Entrar
          </Link>
        </p>
        <p style={{ textAlign: "center", marginTop: "8px" }}>
          <Link href="/" style={{ fontSize: "13px", color: "#999", textDecoration: "none" }}>
            ← Voltar ao início
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1.5px solid #e0e0e0",
  fontSize: "15px",
  fontFamily: "'Montserrat', sans-serif",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  color: "#112d4e",
};
