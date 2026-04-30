"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, Lock, CheckCircle2, AlertCircle } from "lucide-react";

// Wrapper com Suspense porque useSearchParams precisa estar dentro de Suspense
// no Next.js 14+ App Router. Sem isso, o build de produção do Vercel quebra.
export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <RedefinirSenhaContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center">
      <p className="text-sm text-[#003054]/40">Carregando...</p>
    </div>
  );
}

function RedefinirSenhaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  // Se chegou na página sem token, mostra erro imediatamente
  const semToken = !token;

  // Após sucesso, redireciona pra login depois de 3 segundos
  useEffect(() => {
    if (sucesso) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sucesso, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    // Validação client-side
    if (novaSenha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/redefinir-senha`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, nova_senha: novaSenha }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErro(data.detail || "Erro ao redefinir senha. Tente novamente.");
        return;
      }

      setSucesso(true);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const isValid =
    novaSenha.length >= 8 &&
    confirmarSenha.length >= 8 &&
    novaSenha === confirmarSenha;

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
              Nova senha
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-[400px] bg-white border border-[#E8E5E0] rounded-2xl shadow-sm overflow-hidden"
          style={{ boxShadow: "0 2px 24px 0 rgba(0,48,84,0.07)" }}
        >
          {/* ESTADO 1: SEM TOKEN NA URL */}
          {semToken ? (
            <div className="px-8 py-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <h2
                className="text-[22px] font-bold text-[#003054] leading-tight mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Link inválido
              </h2>
              <p className="text-sm text-[#003054]/60 leading-relaxed mb-6">
                Você precisa acessar esta página pelo link enviado no seu e-mail.
              </p>
              <Link
                href="/esqueci-senha"
                className="text-sm font-semibold text-[#E07B2A] hover:text-[#c96a1f] transition-colors"
              >
                Pedir novo link →
              </Link>
            </div>
          ) : sucesso ? (
            /* ESTADO 2: SUCESSO */
            <div className="px-8 py-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#003054]/5 flex items-center justify-center mb-5">
                <CheckCircle2 size={28} className="text-[#003054]" />
              </div>
              <h2
                className="text-[22px] font-bold text-[#003054] leading-tight mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Senha redefinida
              </h2>
              <p className="text-sm text-[#003054]/60 leading-relaxed mb-2">
                Sua senha foi alterada com sucesso.
              </p>
              <p className="text-xs text-[#003054]/40 leading-relaxed">
                Redirecionando para o login...
              </p>
            </div>
          ) : (
            /* ESTADO 3: FORMULÁRIO */
            <>
              {/* Card header */}
              <div className="px-8 pt-8 pb-6 border-b border-[#F0EDE8]">
                <h1
                  className="text-[26px] font-bold text-[#003054] leading-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Redefinir senha
                </h1>
                <p className="mt-1 text-sm text-[#003054]/50">
                  Crie uma nova senha para sua conta
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
                {/* Nova senha */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wide uppercase text-[#003054]/60">
                    Nova senha
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#003054]/30"
                    />
                    <input
                      type={showSenha ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      required
                      autoFocus
                      className="w-full pl-9 pr-11 py-3 text-sm bg-[#F8F7F5] border border-[#E8E5E0] rounded-lg text-[#003054] placeholder:text-[#003054]/30 focus:outline-none focus:border-[#003054] focus:ring-1 focus:ring-[#003054]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha(!showSenha)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#003054]/30 hover:text-[#003054]/60 transition-colors"
                    >
                      {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirmar senha */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wide uppercase text-[#003054]/60">
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#003054]/30"
                    />
                    <input
                      type={showSenha ? "text" : "password"}
                      placeholder="Repita a senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-3 text-sm bg-[#F8F7F5] border border-[#E8E5E0] rounded-lg text-[#003054] placeholder:text-[#003054]/30 focus:outline-none focus:border-[#003054] focus:ring-1 focus:ring-[#003054]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Erro */}
                {erro && (
                  <div className="space-y-2">
                    <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      {erro}
                    </p>
                    {/* Se o erro é de token inválido/expirado, oferece refazer */}
                    {(erro.toLowerCase().includes("inválido") ||
                      erro.toLowerCase().includes("expirado")) && (
                      <Link
                        href="/esqueci-senha"
                        className="block text-xs text-[#E07B2A] hover:text-[#c96a1f] transition-colors text-center"
                      >
                        Pedir novo link →
                      </Link>
                    )}
                  </div>
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
                  {loading ? "Redefinindo..." : "Redefinir senha"}
                </button>
              </form>
            </>
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