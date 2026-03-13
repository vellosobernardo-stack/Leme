"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, senha: password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErro(data.detail || "E-mail ou senha incorretos.");
        return;
      }

      if (data.usuario?.pro_ativo) {
        window.location.href = "/dashboard/pro";
      } else {
        window.location.href = "/assinar";
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const isValid = email.length > 0 && password.length >= 6;

  return (
    <div className="min-h-screen bg-[#F8F7F5] flex flex-col">
      {/* Subtle top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#003054] via-[#E07B2A] to-[#003054]" />

      {/* Main content */}
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
          <div className="text-center">
            <p className="text-sm font-medium tracking-[0.18em] uppercase text-[#003054]/50">
              Área do assinante
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-[400px] bg-white border border-[#E8E5E0] rounded-2xl shadow-sm overflow-hidden"
          style={{ boxShadow: "0 2px 24px 0 rgba(0,48,84,0.07)" }}
        >
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#F0EDE8]">
            <h1
              className="text-[26px] font-bold text-[#003054] leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Entrar
            </h1>
            <p className="mt-1 text-sm text-[#003054]/50">
              Acesse sua conta Leme Pro
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Erro */}
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
                background: isValid && !loading
                  ? "linear-gradient(135deg, #003054 0%, #004a7c 100%)"
                  : "#cccccc",
                color: "white",
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Links externos */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-sm text-[#003054]/50">
            Não tem conta?{" "}
            <Link
              href="/cadastro"
              className="font-semibold text-[#E07B2A] hover:text-[#c96a1f] transition-colors"
            >
              Criar conta
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