"use client";

/**
 * Hook de autenticação — verifica se o usuário está logado
 *
 * Chama GET /auth/me na API. Se retornar 200, o usuário está autenticado.
 * Se retornar 401, o cookie expirou ou não existe.
 *
 * Uso:
 *   const { usuario, carregando, logado } = useAuth();
 */

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://leme-production.up.railway.app";

export interface Usuario {
  id: string;
  nome: string | null;
  email: string;
  plano: "free" | "pro";
  pro_ativo: boolean;
  created_at: string;
}

interface UseAuthReturn {
  usuario: Usuario | null;
  carregando: boolean;
  logado: boolean;
  isPro: boolean;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarSessao() {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: "include", // envia o cookie httpOnly automaticamente
        });

        if (res.ok) {
          const dados = await res.json();
          setUsuario(dados);
        } else {
          setUsuario(null);
        }
      } catch {
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    }

    verificarSessao();
  }, []);

  async function logout() {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUsuario(null);
    window.location.href = "/";
  }

  return {
    usuario,
    carregando,
    logado: !!usuario,
    isPro: !!usuario?.pro_ativo,
    logout,
  };
}
