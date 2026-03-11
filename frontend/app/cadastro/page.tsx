"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, Mail, User, Lock } from "lucide-react";

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const senhasOk = senha.length >= 6 && senha === confirmar;
  const isValid = email.length > 0 && senhasOk;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!senhasOk) {
      setErro("As senhas não conferem ou são muito curtas.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ nome: nome || undefined, email, senha }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErro(data.detail || "Erro ao criar conta.");
        return;
      }

      // Auto-login após cadastro
      const loginRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, senha }),
        }
      );

      if (loginRes.ok) {
        window.location.href = "/assinar";
      } else {
        window.location.href = "/login";
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] flex flex-col">
      {/* Accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#003054] via-[#E07B2A] to-[#003054]" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <Image
            src="/images/logo.svg"
            alt="Leme"
            width={52}
            height={52}
            className="select-none"
          />
          <p className="text-sm font-medium tracking-[0.18em] uppercase text-[#003054]/50">
            Criar conta
          </p>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-[420px] bg-white border border-[#E8E5E0] rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 24px 0 rgba(0,48,84,0.07)" }}
        >
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#F0EDE8]">
            <h1
              className="text-[26px] font-bold text-[#003054] leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Criar conta
            </h1>
            <p className="mt-1 text-sm text-[#003054]/50">
              Comece sua análise financeira hoje
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase text-[#003054]/60">
                Nome{" "}
                <span className="normal-case font-normal text-[#003054]/30">
                  (opcional)
                </span>
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#003054]/30"
                />
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 text-sm bg-[#F8F7F5] border border-[#E8E5E0] rounded-lg text-[#003054] placeholder:text-[#003054]/30 focus:outline-none focus:border-[#003054] focus:ring-1 focus:ring-[#003054]/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase text-[#003054]/60">
                E-mail
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#003054]/30"
                />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 text-sm bg-[#F8F7F5] border border-[#E8E5E0] rounded-lg text-[#003054] placeholder:text-[#003054]/30 focus:outline-none focus:border-[#003054] focus:ring-1 focus:ring-[#003054]/20 transition-all"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase text-[#003054]/60">
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#003054]/30"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full pl-9 pr-11 py-3 text-sm bg-[#F8F7F5] border border-[#E8E5E0] rounded-lg text-[#003054] placeholder:text-[#003054]/30 focus:outline-none focus:border-[#003054] focus:ring-1 focus:ring-[#003054]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#003054]/30 hover:text-[#003054]/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirmar senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase text-[#003054]/60">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#003054]/30"
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repita a senha"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                  className={`w-full pl-9 pr-11 py-3 text-sm bg-[#F8F7F5] border rounded-lg text-[#003054] placeholder:text-[#003054]/30 focus:outline-none transition-all ${
                    confirmar.length > 0 && !senhasOk
                      ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                      : confirmar.length > 0 && senhasOk
                      ? "border-green-300 focus:border-green-400"
                      : "border-[#E8E5E0] focus:border-[#003054] focus:ring-1 focus:ring-[#003054]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#003054]/30 hover:text-[#003054]/60 transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmar.length > 0 && !senhasOk && (
                <p className="text-xs text-red-400">As senhas não conferem</p>
              )}
            </div>

            {/* Erro geral */}
            {erro && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={!isValid || loading}
              className="w-full py-3.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  isValid && !loading
                    ? "linear-gradient(135deg, #003054 0%, #004a7c 100%)"
                    : "#cccccc",
                color: "white",
              }}
            >
              {loading ? "Criando conta..." : "Criar conta grátis"}
            </button>
          </form>
        </div>

        {/* Links externos */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-sm text-[#003054]/50">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#E07B2A] hover:text-[#c96a1f] transition-colors"
            >
              Entrar
            </Link>
          </p>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#003054]/40 hover:text-[#003054]/70 transition-colors"
          >
            <ArrowLeft size={12} />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}