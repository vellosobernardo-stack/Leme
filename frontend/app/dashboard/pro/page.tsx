"use client";

// app/dashboard/pro/page.tsx
// Histórico de análises Pro — tela de boas-vindas para novos usuários
// + acesso rápido à última análise para usuários com histórico

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  PlusCircle, TrendingUp, ExternalLink, Calendar,
  BarChart2, CheckSquare, Stethoscope, ArrowRight, Trash2,
} from "lucide-react";

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
  if (idx === lista.length - 1) return null;
  const atual    = Math.round(lista[idx].score_saude ?? 0);
  const anterior = Math.round(lista[idx + 1].score_saude ?? 0);
  const diff = atual - anterior;
  if (diff === 0) return null;
  return diff > 0 ? `+${diff} pts` : `${diff} pts`;
}

// O que o Pro entrega — usado na tela de boas-vindas
const PRO_FEATURES = [
  { icon: <BarChart2   size={18} />, texto: "8 indicadores financeiros com benchmarks do seu setor" },
  { icon: <Stethoscope size={18} />, texto: "Diagnóstico completo com pontos fortes e de atenção" },
  { icon: <CheckSquare size={18} />, texto: "Plano de ação 30/60/90 dias personalizado" },
  { icon: <TrendingUp  size={18} />, texto: "Simuladores de cenários e sobrevivência de caixa" },
];

export default function DashboardProPage() {
  const { usuario, carregando: carregandoAuth, isPro } = useAuth();
  const router = useRouter();

  const [historico,     setHistorico]     = useState<AnaliseResumo[]>([]);
  const [carregando,    setCarregando]    = useState(true);
  const [erro,          setErro]          = useState<string | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [arquivandoId,  setArquivandoId]  = useState<string | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [arquivandoId,  setArquivandoId]  = useState<string | null>(null);

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

  const ultimoScore  = historico[0] ? Math.round(historico[0].score_saude ?? 0) : null;
  const ultimoStatus = ultimoScore !== null ? scoreStatus(ultimoScore) : null;

  const handleArquivar = async (id: string) => {
    setArquivandoId(id);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_BASE}/api/v1/historico/${id}/arquivar`, {
        method: "PATCH",
        credentials: "include",
      });
      if (response.ok) {
        setHistorico((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Erro ao arquivar:", err);
    } finally {
      setArquivandoId(null);
      setConfirmandoId(null);
    }
  };

  // Loading
  if (carregandoAuth || carregando) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F8F7F5" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width:32, height:32, border:"3px solid #003054", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .pro-root { min-height:100vh; background:#F8F7F5; font-family:'DM Sans',sans-serif; color:#003054; }
        .top-bar  { width:100%; height:3px; background:linear-gradient(90deg,#003054 0%,#E07B2A 50%,#003054 100%); }

        /* HEADER */
        .pro-header { background:#fff; border-bottom:1px solid #ece9e4; position:sticky; top:0; z-index:50; }
        .pro-header-inner { max-width:960px; margin:0 auto; padding:14px 24px; display:flex; align-items:center; justify-content:space-between; }
        .header-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
        .header-logo-text { font-family:'DM Sans',sans-serif; font-weight:700; font-size:20px; color:#003054; }
        .header-right { display:flex; align-items:center; gap:12px; }
        .header-nome { font-size:14px; color:#555; }
        .pro-badge { display:inline-flex; align-items:center; padding:4px 12px; border:1.5px solid #4ECBA4; border-radius:100px; color:#4ECBA4; font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; background:rgba(78,203,164,0.08); }

        /* BODY */
        .pro-body { max-width:960px; margin:0 auto; padding:40px 24px 80px; display:flex; flex-direction:column; gap:28px; animation:fadeUp 0.4s ease both; }

        /* TOPO */
        .topo-row { display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:16px; }
        .topo-titulo { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:#003054; line-height:1.2; }
        .topo-sub { font-size:14px; color:#6b7280; margin-top:6px; }
        .btn-nova { display:inline-flex; align-items:center; gap:8px; background:#003054; color:#fff; padding:12px 20px; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; text-decoration:none; transition:all 0.2s; box-shadow:0 4px 16px rgba(0,48,84,0.2); white-space:nowrap; }
        .btn-nova:hover { background:#004070; transform:translateY(-1px); }

        /* CARD BASE */
        .card { background:#fff; border-radius:16px; border:1px solid #ece9e4; box-shadow:0 1px 4px rgba(0,0,0,0.04); overflow:hidden; }
        .card-header-strip { display:flex; align-items:center; gap:10px; padding:20px 24px 16px; border-bottom:1px solid #f0eeea; }
        .card-icon { width:32px; height:32px; border-radius:8px; background:rgba(0,48,84,0.07); display:flex; align-items:center; justify-content:center; color:#003054; }
        .card-titulo { font-size:15px; font-weight:700; color:#003054; }
        .card-sub-count { margin-left:auto; font-size:13px; color:#9ca3af; }
        .grafico-wrap { padding:8px 24px 24px; }

        /* CARD ÚLTIMA ANÁLISE */
        .card-ultima { background:#fff; border:1.5px solid #003054; border-radius:16px; padding:20px 24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; box-shadow:0 4px 20px rgba(0,48,84,0.08); }
        .ultima-left { display:flex; flex-direction:column; gap:10px; }
        .ultima-eyebrow { font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#9ca3af; }
        .ultima-info { display:flex; align-items:center; gap:14px; }
        .ultima-score-circle { width:52px; height:52px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; color:#fff; flex-shrink:0; }
        .ultima-empresa { font-size:15px; font-weight:600; color:#003054; }
        .ultima-meta { font-size:12px; color:#9ca3af; display:flex; align-items:center; gap:5px; margin-top:2px; }
        .btn-ver-ultima { display:inline-flex; align-items:center; gap:8px; background:#003054; color:#fff; padding:12px 20px; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; text-decoration:none; white-space:nowrap; transition:background 0.2s; }
        .btn-ver-ultima:hover { background:#004070; }

        /* SCORE SUMMARY */
        .score-summary { display:flex; align-items:center; gap:24px; flex-wrap:wrap; padding:20px 24px; }
        .score-numero  { font-family:'Playfair Display',serif; font-size:48px; font-weight:700; color:#003054; line-height:1; }
        .score-divider { width:1px; height:48px; background:#ece9e4; flex-shrink:0; }
        .score-info    { display:flex; flex-direction:column; gap:6px; }
        .score-label-pill { display:inline-flex; align-items:center; padding:4px 12px; border-radius:100px; font-size:13px; font-weight:600; }
        .score-empresa { font-size:13px; color:#6b7280; }
        .score-meta    { display:flex; flex-direction:column; gap:2px; }
        .score-meta-label { font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#bbb; }
        .score-meta-valor { font-size:16px; font-weight:700; color:#003054; }

        /* TABELA */
        .tabela-outer { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .tabela-wrap { display:flex; flex-direction:column; min-width: 480px; }
        .tabela-head-row, .tabela-row { display:grid; grid-template-columns:110px 100px 70px 90px 90px 80px; align-items:center; padding:0 24px; gap:8px; }
        .tabela-head-row { padding-top:12px; padding-bottom:12px; background:#fafaf9; border-bottom:1px solid #f0eeea; }
        .tabela-head-row > span { font-size:11px; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; color:#bbb; }
        .tabela-row { padding-top:14px; padding-bottom:14px; border-bottom:1px solid #f0eeea; cursor:pointer; transition:background 0.15s; }
        .tabela-row:last-child { border-bottom:none; }
        .tabela-row:hover { background:#fafaf9; }
        .tabela-data  { font-size:13px; color:#6b7280; }
        .tabela-ref   { font-size:13px; font-weight:500; color:#003054; }
        .tabela-score { font-size:18px; font-weight:700; color:#003054; }
        .variacao-pos { font-size:13px; font-weight:600; color:#00c894; }
        .variacao-neg { font-size:13px; font-weight:600; color:#e74c3c; }
        .variacao-neu { font-size:13px; color:#bbb; }
        .status-pill  { display:inline-flex; align-items:center; padding:4px 10px; border-radius:100px; font-size:12px; font-weight:600; }
        .link-icon    { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#9ca3af; transition:all 0.15s; }
        .tabela-row:hover .link-icon { background:rgba(0,48,84,0.07); color:#003054; }

        /* BOAS-VINDAS */
        .boas-vindas-card { background:#fff; border-radius:20px; border:1px solid #ece9e4; padding:48px 40px; display:flex; flex-direction:column; align-items:center; text-align:center; gap:32px; box-shadow:0 2px 12px rgba(0,48,84,0.06); }
        .bv-topo { display:flex; flex-direction:column; align-items:center; gap:14px; }
        .bv-logo-wrap { width:72px; height:72px; border-radius:50%; background:rgba(0,48,84,0.06); display:flex; align-items:center; justify-content:center; }
        .bv-titulo { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; color:#003054; line-height:1.3; }
        .bv-sub { font-size:15px; color:#6b7280; line-height:1.6; max-width:420px; }
        .bv-features { display:flex; flex-direction:column; gap:12px; width:100%; max-width:440px; text-align:left; }
        .bv-feature-item { display:flex; align-items:center; gap:14px; padding:12px 16px; background:#F8F7F5; border-radius:10px; }
        .bv-feature-icon { width:36px; height:36px; border-radius:8px; background:rgba(78,203,164,0.12); display:flex; align-items:center; justify-content:center; color:#4ECBA4; flex-shrink:0; }
        .bv-feature-texto { font-size:14px; color:#003054; font-weight:500; line-height:1.4; }
        .btn-comecar { display:inline-flex; align-items:center; gap:10px; background:#003054; color:#fff; padding:16px 32px; border-radius:12px; font-family:'DM Sans',sans-serif; font-size:16px; font-weight:700; text-decoration:none; transition:all 0.2s; box-shadow:0 6px 24px rgba(0,48,84,0.25); }
        .btn-comecar:hover { background:#004070; transform:translateY(-2px); }

        /* ERRO */
        .erro-box { padding:20px 28px; background:#fdf2f2; border-radius:10px; color:#c0392b; font-size:14px; text-align:center; }

        /* RESPONSIVE */
        @media (max-width: 640px) {
          .topo-titulo { font-size:22px; }
          .score-divider { display:none; }
          .card-header-strip { padding:16px 20px 14px; }
          .grafico-wrap { padding:8px 20px 24px; }
          .boas-vindas-card { padding:36px 20px; }
          .bv-titulo { font-size:20px; }
          .btn-ver-ultima { width:100%; justify-content:center; }
          .card-ultima { flex-direction:column; align-items:flex-start; }
        }
      `}</style>

      <div className="pro-root">
        <div className="top-bar" />

        <header className="pro-header">
          <div className="pro-header-inner">
            <Link href="/" className="header-logo">
              <Image src="/images/logo.svg" alt="Leme" width={32} height={32} style={{ height:28, width:"auto" }} />
              <span className="header-logo-text">Leme</span>
            </Link>
            <div className="header-right">
              {nomeExibicao && <span className="header-nome">{nomeExibicao}</span>}
              <span className="pro-badge">Pro</span>
            </div>
          </div>
        </header>

        <div className="pro-body">

          {/* Saudação */}
          <div className="topo-row">
            <div>
              <h1 className="topo-titulo">
                {nomeExibicao ? `Olá, ${nomeExibicao}` : "Suas Análises"}
              </h1>
              <p className="topo-sub">
                {historico.length > 0
                  ? "Acompanhe a evolução financeira da sua empresa"
                  : "Bem-vindo ao Leme Pro"}
              </p>
            </div>
            {historico.length > 0 && (
              <Link href="/analise" className="btn-nova">
                <PlusCircle size={16} />
                Nova Análise
              </Link>
            )}
          </div>

          {/* Erro */}
          {erro && <div className="erro-box">{erro}</div>}

          {/* Zero análises — tela de boas-vindas */}
          {!erro && !carregando && historico.length === 0 && (
            <div className="boas-vindas-card">
              <div className="bv-topo">
                <div className="bv-logo-wrap">
                  <Image src="/images/logo.svg" alt="Leme" width={36} height={36} style={{ height:34, width:"auto" }} />
                </div>
                <h2 className="bv-titulo">
                  Sua primeira análise está<br />a um passo
                </h2>
                <p className="bv-sub">
                  Em menos de 3 minutos, receba um diagnóstico financeiro completo — com score, indicadores e plano de ação personalizado.
                </p>
              </div>

              <div className="bv-features">
                {PRO_FEATURES.map((f, i) => (
                  <div key={i} className="bv-feature-item">
                    <div className="bv-feature-icon">{f.icon}</div>
                    <span className="bv-feature-texto">{f.texto}</span>
                  </div>
                ))}
              </div>

              <Link href="/analise" className="btn-comecar">
                <PlusCircle size={20} />
                Fazer minha primeira análise
              </Link>
            </div>
          )}

          {/* Com análises — acesso rápido à última */}
          {!erro && historico.length > 0 && ultimoScore !== null && ultimoStatus && (
            <div className="card-ultima">
              <div className="ultima-left">
                <span className="ultima-eyebrow">Última análise</span>
                <div className="ultima-info">
                  <div className="ultima-score-circle" style={{ background: ultimoStatus.cor }}>
                    {ultimoScore}
                  </div>
                  <div>
                    <p className="ultima-empresa">{historico[0].nome_empresa}</p>
                    <p className="ultima-meta">
                      <Calendar size={11} />
                      {MESES[historico[0].mes_referencia - 1]}/{historico[0].ano_referencia}
                      &nbsp;·&nbsp;{historico[0].setor}
                    </p>
                  </div>
                </div>
              </div>
              <Link href={`/dashboard/pro/${historico[0].id}`} className="btn-ver-ultima">
                Ver resultado completo
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* Score summary */}
          {!erro && historico.length > 0 && ultimoScore !== null && ultimoStatus && (
            <div className="card">
              <div className="score-summary">
                <div>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#bbb", marginBottom:8 }}>Score atual</div>
                  <span className="score-numero">{ultimoScore}</span>
                </div>
                <div className="score-divider" />
                <div className="score-info">
                  <span className="score-label-pill" style={{ background:ultimoStatus.bg, color:ultimoStatus.cor }}>{ultimoStatus.label}</span>
                  <span className="score-empresa">{historico[0].nome_empresa} · {historico[0].setor}</span>
                </div>
                <div className="score-divider" style={{ marginLeft:"auto" }} />
                <div className="score-meta">
                  <span className="score-meta-label">Última análise</span>
                  <span className="score-meta-valor">{MESES[historico[0].mes_referencia - 1]}/{historico[0].ano_referencia}</span>
                </div>
                <div className="score-meta">
                  <span className="score-meta-label">Total de análises</span>
                  <span className="score-meta-valor">{historico.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico */}
          {dadosGrafico.length >= 2 && (
            <div className="card">
              <div className="card-header-strip">
                <div className="card-icon"><TrendingUp size={17} /></div>
                <span className="card-titulo">Evolução do Score</span>
              </div>
              <div className="grafico-wrap">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dadosGrafico} margin={{ top:12, right:12, left:-10, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0eeea" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize:12, fill:"#9ca3af", fontFamily:"DM Sans" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0,100]} tick={{ fontSize:12, fill:"#9ca3af", fontFamily:"DM Sans" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v ?? 0} pts`, "Score"]} contentStyle={{ borderRadius:10, border:"none", boxShadow:"0 4px 20px rgba(0,48,84,0.12)", fontFamily:"DM Sans", fontSize:13 }} />
                    <Line type="monotone" dataKey="score" stroke="#003054" strokeWidth={2.5} dot={{ r:5, fill:"#003054", strokeWidth:0 }} activeDot={{ r:7, fill:"#E07B2A", strokeWidth:0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tabela */}
          {historico.length > 0 && (
            <div className="card">
              <div className="card-header-strip">
                <div className="card-icon"><Calendar size={17} /></div>
                <span className="card-titulo">Histórico de Análises</span>
                <span className="card-sub-count">{historico.length} análise{historico.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="tabela-outer">
                <div className="tabela-wrap">
                <div className="tabela-head-row">
                  <span>Data</span><span>Referência</span><span>Score</span>
                  <span>Variação</span><span>Status</span><span></span>
                </div>
                {historico.map((a, idx) => {
                  const score = Math.round(a.score_saude ?? 0);
                  const st    = scoreStatus(score);
                  const vari  = variacao(historico, idx);
                  const isPos = vari?.startsWith("+");
                  const isNeg = vari?.startsWith("-");
                  return (
                    <div key={a.id} className="tabela-row" onClick={() => router.push(`/dashboard/pro/${a.id}`)}>
                      <span className="tabela-data">{formatarData(a.created_at)}</span>
                      <span className="tabela-ref">{MESES[a.mes_referencia - 1]}/{a.ano_referencia}</span>
                      <span className="tabela-score">{score}</span>
                      <span className={isPos ? "variacao-pos" : isNeg ? "variacao-neg" : "variacao-neu"}>{vari ?? "—"}</span>
                      <span><span className="status-pill" style={{ background:st.bg, color:st.cor }}>{st.label}</span></span>
                      <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                        {confirmandoId === a.id ? (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleArquivar(a.id); }}
                              disabled={arquivandoId === a.id}
                              style={{ fontSize:11, padding:"4px 8px", background:"#e74c3c", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", opacity: arquivandoId === a.id ? 0.5 : 1 }}>
                              {arquivandoId === a.id ? "..." : "Remover"}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setConfirmandoId(null); }}
                              style={{ fontSize:11, padding:"4px 8px", background:"#f0eeea", color:"#555", border:"none", borderRadius:6, cursor:"pointer" }}>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="link-icon"><ExternalLink size={15} /></div>
                            <button onClick={(e) => { e.stopPropagation(); setConfirmandoId(a.id); }}
                              style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:"#9ca3af", display:"flex", alignItems:"center", borderRadius:6, transition:"color 0.15s" }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#e74c3c")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}>
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}