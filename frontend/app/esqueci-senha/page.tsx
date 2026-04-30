"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/esqueci-senha`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      // Backend retorna sempre 200 com mensagem genérica
      // (não revela se o email existe ou não — segurança).
      // Por isso, mesmo em "erro", mostramos sucesso ao usuário.
      if (!res.ok) {
        // Erro real de servidor (500, 422, etc.) — algo quebrou de verdade
        const data = await res.json().catch(() => ({}));
        setErro(data.detail || "Erro de conexão. Tente novamente.");
        return;
      }

      setEnviado(true);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const isValid = email.length > 0 && email.includes("@") && email.includes(".");

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
              Recuperação de acesso
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-[400px] bg-white border border-[#E8E5E0] rounded-2xl shadow-sm overflow-hidden"
          style={{ boxShadow: "0 2px 24px 0 rgba(0,48,84,0.07)" }}
        >
          {!enviado ? (
            <>
              {/* Card header */}
              <div className="px-8 pt-8 pb-6 border-b border-[#F0EDE8]">
                <h1
                  className="text-[26px] font-bold text-[#003054] leading-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Esqueci minha senha
                </h1>
                <p className="mt-1 text-sm text-[#003054]/50">
                  Enviaremos um link para você redefinir
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wide uppercase text-[#003054]/60">
                    E-mail cadastrado
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
                      autoFocus
                      className="w-full pl-9 pr-4 py-3 text-sm bg-[#F8F7F5] border border-[#E8E5E0] rounded-lg text-[#003054] placeholder:text-[#003054]/30 focus:outline-none focus:border-[#003054] focus:ring-1 focus:ring-[#003054]/20 transition-all"
                    />
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
                  {loading ? "Enviando..." : "Enviar link de redefinição"}
                </button>
              </form>
            </>
          ) : (
            /* Estado de sucesso */
            <div className="px-8 py-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#003054]/5 flex items-center justify-center mb-5">
                <CheckCircle2 size={28} className="text-[#003054]" />
              </div>
              <h2
                className="text-[22px] font-bold text-[#003054] leading-tight mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Verifique seu e-mail
              </h2>
              <p className="text-sm text-[#003054]/60 leading-relaxed mb-2">
                Se este e-mail existe na nossa base, você vai receber um link
                em alguns minutos.
              </p>
              <p className="text-xs text-[#003054]/40 leading-relaxed">
                O link tem validade de 1 hora. Se não chegar, confira o spam
                ou tente novamente.
              </p>
            </div>
          )}
        </div>

        {/* Links externos */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs text-[#003054]/40 hover:text-[#003054]/70 transition-colors"
          >
            <ArrowLeft size={12} />
            Voltar para login
          </Link>
        </div>
      </div>
    </div>
  );
}