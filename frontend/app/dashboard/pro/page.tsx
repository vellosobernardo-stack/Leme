"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import { PlusCircle, TrendingUp, ExternalLink, Calendar, Award } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { buscarHistorico } from "@/lib/api";

interface AnaliseResumo {
  id: string;
  nome_empresa: string;
  setor: string;
  mes_referencia: number;
  ano_referencia: number;
  score_saude: number | null;
  tendencia_status: string | null;
  created_at: string;
}

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function formatarData(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function scoreStatus(score: number): { label: string; cor: string; bg: string } {
  if (score >= 70) return { label: "Saudável", cor: "#00c894", bg: "rgba(0,200,148,0.1)" };
  if (score >= 40) return { label: "Atenção",  cor: "#E07B2A", bg: "rgba(224,123,42,0.1)" };
  return              { label: "Crítico",   cor: "#e74c3c", bg: "rgba(231,76,60,0.1)"  };
}

function variacao(lista: AnaliseResumo[], idx: number): string | null {
  if (idx === lista.length - 1) return null; // mais antiga = sem anterior
  const atual   = Math.round(lista[idx].score_saude ?? 0);
  const anterior = Math.round(lista[idx + 1].score_saude ?? 0);
  const diff = atual - anterior;
  if (diff === 0) return null;
  return diff > 0 ? `+${diff} pts` : `${diff} pts`;
}

export default function DashboardProPage() {
  const { usuario, carregando: carregandoAuth, isPro } = useAuth();
  const router = useRouter();

  const [historico, setHistorico] = useState<AnaliseResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!carregandoAuth && !isPro) router.replace("/");
  }, [carregandoAuth, isPro, router]);

  useEffect(() => {
    if (!isPro) return;
    buscarHistorico()
      .then(setHistorico)
      .catch(() => setErro("Não foi possível carregar o histórico."))
      .finally(() => setCarregando(false));
  }, [isPro]);

  const dadosGrafico = [...historico].reverse().map((a) => ({
    label: `${MESES[a.mes_referencia - 1]}/${String(a.ano_referencia).slice(-2)}`,
    score: Math.round(a.score_saude ?? 0),
  }));

  const nomeExibicao = usuario?.nome
    ? usuario.nome.split(" ")[0]
    : usuario?.email?.split("@")[0] ?? "";

  const ultimoScore = historico[0] ? Math.round(historico[0].score_saude ?? 0) : null;
  const ultimoStatus = ultimoScore !== null ? scoreStatus(ultimoScore) : null;

  if (carregandoAuth || (!isPro && !carregandoAuth)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8F7F5" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #003054", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pro-root {
          min-height: 100vh;
          background: #F8F7F5;
          font-family: 'Montserrat', sans-serif;
          color: #003054;
        }

        /* ── TOP BAR ── */
        .top-bar {
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #003054 0%, #E07B2A 50%, #003054 100%);
        }

        /* ── HEADER ── */
        .pro-header {
          background: #fff;
          border-bottom: 1px solid #ece9e4;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .pro-header-inner {
          max-width: 960px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .header-logo-text {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 20px;
          color: #003054;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-nome {
          font-size: 14px;
          color: #555;
          font-weight: 400;
        }

        .pro-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border: 1.5px solid #4ECBA4;
          border-radius: 100px;
          color: #4ECBA4;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: rgba(78,203,164,0.08);
        }

        /* ── BODY ── */
        .pro-body {
          max-width: 960px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          animation: fadeUp 0.4s ease both;
        }

        /* ── TOPO: saudação + botão ── */
        .topo-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .topo-titulo {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #003054;
          line-height: 1.2;
        }

        .topo-sub {
          font-size: 14px;
          color: #6b7280;
          margin-top: 6px;
          font-weight: 400;
        }

        .btn-nova {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #003054;
          color: #fff;
          padding: 12px 20px;
          border-radius: 10px;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(0,48,84,0.2);
          white-space: nowrap;
        }
        .btn-nova:hover {
          background: #004070;
          box-shadow: 0 6px 24px rgba(0,48,84,0.3);
          transform: translateY(-1px);
        }

        /* ── CARD GENÉRICO ── */
        .card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 20px rgba(0,48,84,0.07), 0 1px 4px rgba(0,48,84,0.04);
          overflow: hidden;
        }

        .card-header-strip {
          padding: 20px 28px 16px;
          border-bottom: 1px solid #f0eeea;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: #F8F7F5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #003054;
          opacity: 0.7;
          flex-shrink: 0;
        }

        .card-titulo {
          font-size: 15px;
          font-weight: 600;
          color: #003054;
        }

        .card-sub-count {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
          margin-left: auto;
        }

        /* ── SCORE SUMMARY ── */
        .score-summary {
          padding: 24px 28px;
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .score-numero {
          font-family: 'Playfair Display', serif;
          font-size: 52px;
          font-weight: 700;
          color: #003054;
          line-height: 1;
        }

        .score-info { display: flex; flex-direction: column; gap: 6px; }

        .score-label-pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          width: fit-content;
        }

        .score-empresa {
          font-size: 13px;
          color: #6b7280;
        }

        .score-divider {
          width: 1px;
          height: 56px;
          background: #ece9e4;
          flex-shrink: 0;
        }

        .score-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .score-meta-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
        .score-meta-valor { font-size: 15px; font-weight: 600; color: #003054; }

        /* ── GRÁFICO ── */
        .grafico-wrap { padding: 8px 28px 28px; }

        /* ── TABELA ── */
        .tabela-wrap { padding: 0; }

        .tabela-row,
        .tabela-head-row {
          display: flex;
          align-items: center;
          padding: 0 28px;
        }

        .tabela-row {
          border-bottom: 1px solid #f4f2ef;
          transition: background 0.15s;
          cursor: pointer;
          min-height: 56px;
        }
        .tabela-row:last-child { border-bottom: none; }
        .tabela-row:hover { background: #faf9f7; }

        .tabela-head-row {
          border-bottom: 1px solid #f0eeea;
          min-height: 40px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6b7280;
        }

        /* larguras das colunas — head e row usam as mesmas classes */
        .col-data     { width: 130px; flex-shrink: 0; }
        .col-ref      { flex: 1; }
        .col-score    { width: 72px; flex-shrink: 0; text-align: right; }
        .col-var      { width: 88px; flex-shrink: 0; padding-left: 12px; }
        .col-status   { width: 100px; flex-shrink: 0; }
        .col-link     { width: 36px; flex-shrink: 0; display: flex; justify-content: flex-end; }

        .tabela-data  { font-size: 13px; color: #6b7280; }
        .tabela-ref   { font-size: 14px; font-weight: 500; color: #003054; }

        .tabela-score {
          font-size: 18px;
          font-weight: 700;
          color: #003054;
          font-family: 'Playfair Display', serif;
        }

        .variacao-pos { font-size: 12px; font-weight: 600; color: #00c894; white-space: nowrap; }
        .variacao-neg { font-size: 12px; font-weight: 600; color: #e74c3c; white-space: nowrap; }
        .variacao-neu { font-size: 12px; color: #9ca3af; }

        .status-pill {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .link-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #003054;
          opacity: 0.25;
          transition: opacity 0.2s;
        }
        .tabela-row:hover .link-icon { opacity: 0.6; }

        /* ── EMPTY STATE ── */
        .empty-state {
          padding: 56px 28px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #F8F7F5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #003054;
          opacity: 0.3;
          margin-bottom: 4px;
        }
        .empty-titulo { font-size: 16px; font-weight: 600; color: #003054; }
        .empty-sub { font-size: 14px; color: #bbb; }

        /* ── ERRO ── */
        .erro-box {
          padding: 20px 28px;
          background: #fdf2f2;
          border-radius: 10px;
          color: #c0392b;
          font-size: 14px;
          text-align: center;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .topo-titulo { font-size: 22px; }
          .tabela-head,
          .tabela-row { grid-template-columns: 100px 1fr 70px 80px 36px; }
          .tabela-head > *:nth-child(4),
          .tabela-row  > *:nth-child(4) { display: none; }
          .score-divider { display: none; }
          .card-header-strip { padding: 16px 20px 14px; }
          .grafico-wrap { padding: 8px 20px 24px; }
          .tabela-head, .tabela-row { padding-left: 20px; padding-right: 20px; }
        }
      `}</style>

      <div className="pro-root">
        <div className="top-bar" />

        {/* Header */}
        <header className="pro-header">
          <div className="pro-header-inner">
            <Link href="/" className="header-logo">
              <Image src="/images/logo.svg" alt="Leme" width={32} height={32} style={{ height: 28, width: "auto" }} />
              <span className="header-logo-text">Leme</span>
            </Link>
            <div className="header-right">
              {nomeExibicao && <span className="header-nome">{nomeExibicao}</span>}
              <span className="pro-badge">Pro</span>
            </div>
          </div>
        </header>

        <div className="pro-body">

          {/* Saudação + botão */}
          <div className="topo-row">
            <div>
              <h1 className="topo-titulo">
                {nomeExibicao ? `Olá, ${nomeExibicao}` : "Suas Análises"}
              </h1>
              <p className="topo-sub">Acompanhe a evolução financeira da sua empresa</p>
            </div>
            <Link href="/analise" className="btn-nova">
              <PlusCircle size={16} />
              Nova Análise
            </Link>
          </div>

          {/* Card de resumo do último score */}
          {ultimoScore !== null && ultimoStatus && historico[0] && (
            <div className="card">
              <div className="score-summary">
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb", marginBottom: 8 }}>
                    Score atual
                  </div>
                  <span className="score-numero">{ultimoScore}</span>
                </div>

                <div className="score-divider" />

                <div className="score-info">
                  <span
                    className="score-label-pill"
                    style={{ background: ultimoStatus.bg, color: ultimoStatus.cor }}
                  >
                    {ultimoStatus.label}
                  </span>
                  <span className="score-empresa">
                    {historico[0].nome_empresa} · {historico[0].setor}
                  </span>
                </div>

                <div className="score-divider" style={{ marginLeft: "auto" }} />

                <div className="score-meta">
                  <span className="score-meta-label">Última análise</span>
                  <span className="score-meta-valor">
                    {MESES[historico[0].mes_referencia - 1]}/{historico[0].ano_referencia}
                  </span>
                </div>

                <div className="score-meta">
                  <span className="score-meta-label">Total de análises</span>
                  <span className="score-meta-valor">{historico.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico de evolução */}
          {dadosGrafico.length >= 2 && (
            <div className="card">
              <div className="card-header-strip">
                <div className="card-icon"><TrendingUp size={17} /></div>
                <span className="card-titulo">Evolução do Score</span>
              </div>
              <div className="grafico-wrap">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dadosGrafico} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0eeea" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: "#9ca3af", fontFamily: "Montserrat" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: "#9ca3af", fontFamily: "Montserrat" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(v: number) => [`${v} pts`, "Score"]}
                      contentStyle={{
                        borderRadius: 10,
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,48,84,0.12)",
                        fontFamily: "Montserrat",
                        fontSize: 13,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#003054"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: "#003054", strokeWidth: 0 }}
                      activeDot={{ r: 7, fill: "#E07B2A", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tabela de histórico */}
          <div className="card">
            <div className="card-header-strip">
              <div className="card-icon"><Calendar size={17} /></div>
              <span className="card-titulo">Histórico de Análises</span>
              <span className="card-sub-count">{historico.length} análise{historico.length !== 1 ? "s" : ""}</span>
            </div>

            {carregando ? (
              <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
                <div style={{ width: 28, height: 28, border: "3px solid #003054", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : erro ? (
              <div className="erro-box">{erro}</div>
            ) : historico.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Award size={22} /></div>
                <p className="empty-titulo">Nenhuma análise ainda</p>
                <p className="empty-sub">Faça sua primeira análise para começar a acompanhar sua evolução</p>
              </div>
            ) : (
              <div className="tabela-wrap">
                {/* Header */}
                <div className="tabela-head-row">
                  <span className="col-data">Data</span>
                  <span className="col-ref">Referência</span>
                  <span className="col-score">Score</span>
                  <span className="col-var">Variação</span>
                  <span className="col-status">Status</span>
                  <span className="col-link"></span>
                </div>
                {/* Rows */}
                {historico.map((a, idx) => {
                  const score = Math.round(a.score_saude ?? 0);
                  const st = scoreStatus(score);
                  const vari = variacao(historico, idx);
                  const isPos = vari && vari.startsWith("+");
                  const isNeg = vari && vari.startsWith("-");
                  return (
                    <div key={a.id} className="tabela-row"
                      onClick={() => router.push(`/dashboard/${a.id}`)}>
                      <span className="col-data tabela-data">{formatarData(a.created_at)}</span>
                      <span className="col-ref tabela-ref">
                        {MESES[a.mes_referencia - 1]}/{a.ano_referencia}
                      </span>
                      <span className="col-score tabela-score">{score}</span>
                      <span className={`col-var ${isPos ? "variacao-pos" : isNeg ? "variacao-neg" : "variacao-neu"}`}>
                        {vari ?? "—"}
                      </span>
                      <span className="col-status">
                        <span className="status-pill" style={{ background: st.bg, color: st.cor }}>
                          {st.label}
                        </span>
                      </span>
                      <span className="col-link">
                        <div className="link-icon">
                          <ExternalLink size={15} />
                        </div>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}