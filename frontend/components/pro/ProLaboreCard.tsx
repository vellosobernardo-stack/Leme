'use client';

// components/pro/ProLaboreCard.tsx
// Calculadora de pró-labore seguro — mini-fluxo com 4 perguntas.
// Resultado efêmero: não salvo no banco, recalculável quantas vezes quiser.
// Sem chamada ao backend ou à IA — 100% frontend.

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, RefreshCw, DollarSign, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface ProLaboreCardProps {
  retirada_atual?: number | null;
}

type Estado =
  | 'idle'
  | 'pergunta-1'
  | 'pergunta-2'
  | 'pergunta-3'
  | 'pergunta-4'
  | 'resultado';

interface Dados {
  saldo_atual: string;
  contas_pagar: string;
  tem_entrada_extra: boolean | null;
  valor_entrada_extra: string;
  tem_retirada_atual: boolean | null;
  retirada_atual_valor: string;
}

const DADOS_INICIAL: Dados = {
  saldo_atual: '',
  contas_pagar: '',
  tem_entrada_extra: null,
  valor_entrada_extra: '',
  tem_retirada_atual: null,
  retirada_atual_valor: '',
};

function parseMoeda(v: string): number {
  const limpo = v.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(limpo);
  return isNaN(n) ? 0 : n;
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CampoMoeda({
  label,
  valor,
  onChange,
  placeholder,
  autoFocus,
  onEnter,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onEnter?: () => void;
}) {
  return (
    <div className="prolabore-campo">
      <label className="prolabore-campo-label">{label}</label>
      <div className="prolabore-campo-input-wrap">
        <span className="prolabore-campo-prefix">R$</span>
        <input
          type="text"
          inputMode="decimal"
          min={0}
          className="prolabore-campo-input"
          value={valor}
          placeholder={placeholder ?? '0,00'}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => {
            const num = parseFloat(e.target.value.replace(/\./g, '').replace(',', '.'));
            if (!isNaN(num) && num > 0) {
              onChange(num.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
            }
          }}
          onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) onEnter(); }}
        />
      </div>
    </div>
  );
}

function ProgressoSteps({ atual, total }: { atual: number; total: number }) {
  return (
    <div className="prolabore-progresso">
      <div className="prolabore-progresso-steps">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`prolabore-progresso-step ${i < atual ? 'ativo' : ''} ${i === atual - 1 ? 'atual' : ''}`}
          />
        ))}
      </div>
      <span className="prolabore-progresso-texto">Pergunta {atual} de {total}</span>
    </div>
  );
}

export default function ProLaboreCard({ retirada_atual }: ProLaboreCardProps) {
  const [estado, setEstado] = useState<Estado>('idle');
  const [dados, setDados] = useState<Dados>(DADOS_INICIAL);
  const [breakdownAberto, setBreakdownAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function set<K extends keyof Dados>(campo: K, valor: Dados[K]) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
    setErro(null);
  }

  function validarEAvancar(proximoEstado: Estado, validar: () => boolean) {
    if (!validar()) return;
    setErro(null);
    setEstado(proximoEstado);
  }

  const resultado = useMemo(() => {
    if (estado !== 'resultado') return null;
    const saldo = parseMoeda(dados.saldo_atual);
    const contas = parseMoeda(dados.contas_pagar);
    const entradas = dados.tem_entrada_extra ? parseMoeda(dados.valor_entrada_extra) : 0;

    const reserva_minima = contas * 3;
    const disponivel = saldo + entradas - contas;
    const folga = disponivel - reserva_minima;
    const retirada_segura = Math.max(0, folga);

    const retirada_ref = retirada_atual ??
      (dados.tem_retirada_atual ? parseMoeda(dados.retirada_atual_valor) : null);

    return { saldo, contas, entradas, reserva_minima, disponivel, folga, retirada_segura, retirada_ref };
  }, [estado, dados, retirada_atual]);

  function reiniciar() {
    setEstado('idle');
    setDados(DADOS_INICIAL);
    setErro(null);
    setBreakdownAberto(false);
  }

  // ─── IDLE ───────────────────────────────────────────────────────────────────
  if (estado === 'idle') {
    return (
      <>
        <Styles />
        <div className="prolabore-card prolabore-idle">
          <div className="prolabore-idle-icone">
            <DollarSign size={22} color="#003054" />
          </div>
          <div className="prolabore-idle-texto">
            <p className="prolabore-idle-titulo">Quanto posso retirar este mês?</p>
            <p className="prolabore-idle-sub">
              Calcule agora o valor de pró-labore seguro com base na situação atual do caixa da sua empresa.
            </p>
          </div>
          <button className="prolabore-btn-primario" onClick={() => setEstado('pergunta-1')}>
            Calcular agora
            <ChevronRight size={16} />
          </button>
        </div>
      </>
    );
  }

  // ─── PERGUNTA 1 — Saldo atual ────────────────────────────────────────────────
  if (estado === 'pergunta-1') {
    return (
      <>
        <Styles />
        <div className="prolabore-card prolabore-fluxo">
          <ProgressoSteps atual={1} total={4} />
          <p className="prolabore-pergunta-titulo">Qual o saldo disponível agora na conta da empresa? (não inclua valores a receber)</p>
          <CampoMoeda
            label="Saldo na conta"
            valor={dados.saldo_atual}
            onChange={(v) => set('saldo_atual', v)}
            autoFocus
            onEnter={() => validarEAvancar('pergunta-2', () => {
              if (parseMoeda(dados.saldo_atual) <= 0) { setErro('Informe o saldo atual (maior que zero).'); return false; }
              return true;
            })}
          />
          {erro && <p className="prolabore-erro">{erro}</p>}
          <div className="prolabore-nav">
            <span />
            <button
              className="prolabore-btn-primario"
              onClick={() => validarEAvancar('pergunta-2', () => {
                if (parseMoeda(dados.saldo_atual) <= 0) { setErro('Informe o saldo atual (maior que zero).'); return false; }
                return true;
              })}
            >
              Continuar <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── PERGUNTA 2 — Contas a pagar ────────────────────────────────────────────
  if (estado === 'pergunta-2') {
    return (
      <>
        <Styles />
        <div className="prolabore-card prolabore-fluxo">
          <ProgressoSteps atual={2} total={4} />
          <p className="prolabore-pergunta-titulo">Quanto sua empresa tem a pagar nos próximos 30 dias?</p>
          <p className="prolabore-pergunta-sub">Inclua fornecedores, aluguel, salários e outros compromissos.</p>
          <CampoMoeda
            label="Contas a pagar (30 dias)"
            valor={dados.contas_pagar}
            onChange={(v) => set('contas_pagar', v)}
            autoFocus
            onEnter={() => validarEAvancar('pergunta-3', () => {
              if (parseMoeda(dados.contas_pagar) < 0) { setErro('Informe um valor válido.'); return false; }
              return true;
            })}
          />
          {erro && <p className="prolabore-erro">{erro}</p>}
          <div className="prolabore-nav">
            <button className="prolabore-btn-voltar" onClick={() => setEstado('pergunta-1')}>
              <ChevronLeft size={16} /> Voltar
            </button>
            <button
              className="prolabore-btn-primario"
              onClick={() => validarEAvancar('pergunta-3', () => {
                if (parseMoeda(dados.contas_pagar) < 0) { setErro('Informe um valor válido.'); return false; }
                return true;
              })}
            >
              Continuar <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── PERGUNTA 3 — Entrada extraordinária ────────────────────────────────────
  if (estado === 'pergunta-3') {
    return (
      <>
        <Styles />
        <div className="prolabore-card prolabore-fluxo">
          <ProgressoSteps atual={3} total={4} />
          <p className="prolabore-pergunta-titulo">Tem algum recebimento extraordinário garantido esta semana?</p>
          <p className="prolabore-pergunta-sub">Ex: PIX confirmado, venda de ativo, entrada pontual.</p>
          <div className="prolabore-radio-grupo">
            <button
              className={`prolabore-radio-btn ${dados.tem_entrada_extra === true ? 'ativo' : ''}`}
              onClick={() => set('tem_entrada_extra', true)}
            >Sim</button>
            <button
              className={`prolabore-radio-btn ${dados.tem_entrada_extra === false ? 'ativo' : ''}`}
              onClick={() => set('tem_entrada_extra', false)}
            >Não</button>
          </div>
          {dados.tem_entrada_extra === true && (
            <CampoMoeda
              label="Valor da entrada prevista"
              valor={dados.valor_entrada_extra}
              onChange={(v) => set('valor_entrada_extra', v)}
              autoFocus
            />
          )}
          {erro && <p className="prolabore-erro">{erro}</p>}
          <div className="prolabore-nav">
            <button className="prolabore-btn-voltar" onClick={() => setEstado('pergunta-2')}>
              <ChevronLeft size={16} /> Voltar
            </button>
            <button
              className="prolabore-btn-primario"
              onClick={() => validarEAvancar('pergunta-4', () => {
                if (dados.tem_entrada_extra === null) { setErro('Selecione uma opção.'); return false; }
                if (dados.tem_entrada_extra && parseMoeda(dados.valor_entrada_extra) <= 0) {
                  setErro('Informe o valor da entrada prevista.'); return false;
                }
                return true;
              })}
            >
              Continuar <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── PERGUNTA 4 — Retirada atual ────────────────────────────────────────────
  if (estado === 'pergunta-4') {
    // Se retirada_atual foi passada por prop, pular direto para resultado
    const jaTemRetirada = retirada_atual != null && retirada_atual > 0;

    return (
      <>
        <Styles />
        <div className="prolabore-card prolabore-fluxo">
          <ProgressoSteps atual={4} total={4} />
          <p className="prolabore-pergunta-titulo">Você já tem uma retirada mensal definida?</p>
          <p className="prolabore-pergunta-sub">
            {jaTemRetirada
              ? `Identificamos uma retirada de R$ ${formatarMoeda(retirada_atual!)} na sua última análise.`
              : 'Vamos comparar com o valor seguro calculado.'}
          </p>
          {!jaTemRetirada && (
            <>
              <div className="prolabore-radio-grupo">
                <button
                  className={`prolabore-radio-btn ${dados.tem_retirada_atual === true ? 'ativo' : ''}`}
                  onClick={() => set('tem_retirada_atual', true)}
                >Sim</button>
                <button
                  className={`prolabore-radio-btn ${dados.tem_retirada_atual === false ? 'ativo' : ''}`}
                  onClick={() => set('tem_retirada_atual', false)}
                >Não</button>
              </div>
              {dados.tem_retirada_atual === true && (
                <CampoMoeda
                  label="Valor da retirada mensal atual"
                  valor={dados.retirada_atual_valor}
                  onChange={(v) => set('retirada_atual_valor', v)}
                  autoFocus
                />
              )}
            </>
          )}
          {erro && <p className="prolabore-erro">{erro}</p>}
          <div className="prolabore-nav">
            <button className="prolabore-btn-voltar" onClick={() => setEstado('pergunta-3')}>
              <ChevronLeft size={16} /> Voltar
            </button>
            <button
              className="prolabore-btn-primario"
              onClick={() => validarEAvancar('resultado', () => {
                if (!jaTemRetirada && dados.tem_retirada_atual === null) {
                  setErro('Selecione uma opção.'); return false;
                }
                if (!jaTemRetirada && dados.tem_retirada_atual === true && parseMoeda(dados.retirada_atual_valor) <= 0) {
                  setErro('Informe o valor da retirada atual.'); return false;
                }
                return true;
              })}
            >
              Ver resultado <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── RESULTADO ───────────────────────────────────────────────────────────────
  if (estado === 'resultado' && resultado) {
    const { saldo, contas, entradas, reserva_minima, disponivel, retirada_segura, retirada_ref } = resultado;
    const acimaDoseguro = retirada_ref != null && retirada_ref > retirada_segura;
    const semRetirada = retirada_segura === 0;

    return (
      <>
        <Styles />
        <div className="prolabore-card prolabore-resultado">
          {/* Alerta — retirada acima do seguro */}
          {acimaDoseguro && (
            <div className="prolabore-alerta-amarelo">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>
                Sua retirada atual de <strong>R$ {formatarMoeda(retirada_ref!)}</strong> está acima do valor seguro para este mês.
              </span>
            </div>
          )}

          {/* Valor principal */}
          <div className="prolabore-resultado-principal">
            <p className="prolabore-resultado-label">Considerando apenas o que está disponível agora, você pode retirar com segurança até</p>
            {semRetirada ? (
              <p className="prolabore-resultado-zero">
                Sua empresa não comporta retirada segura este mês. Consulte o plano de ação.
              </p>
            ) : (
              <p className="prolabore-resultado-valor">
                R$ <strong>{formatarMoeda(retirada_segura)}</strong>
              </p>
            )}
            <p className="prolabore-resultado-contexto">com base nos dados informados agora</p>
          </div>

          {/* Breakdown colapsável */}
          <button
            className="prolabore-breakdown-toggle"
            onClick={() => setBreakdownAberto((v) => !v)}
          >
            <span>Ver detalhamento</span>
            {breakdownAberto ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {breakdownAberto && (
            <div className="prolabore-breakdown">
              <BreakdownLinha label="Saldo atual na conta" valor={saldo} />
              {entradas > 0 && <BreakdownLinha label="Entradas previstas" valor={entradas} />}
              <BreakdownLinha label="Contas a pagar (30 dias)" valor={-contas} negativo />
              <div className="prolabore-breakdown-divider" />
              <BreakdownLinha label="Disponível" valor={disponivel} destaque />
              <BreakdownLinha label="Reserva mínima (90 dias)" valor={-reserva_minima} negativo />
              <div className="prolabore-breakdown-divider" />
              <BreakdownLinha label="Disponível para retirada" valor={retirada_segura} destaque />
            </div>
          )}

          {/* Disclaimer — sempre visível */}
          <div className="prolabore-disclaimer">
            <p>
              Este cálculo considera apenas o saldo atual e compromissos imediatos. Não inclui receitas que você espera receber ao longo do mês. 
              Se sua empresa tem receitas previsíveis chegando esta semana, elas podem ser incluídas como recebimento extraordinário garantido.
              Imprevistos ou compromissos não informados podem alterar esse número.
              Recalcule sempre que sua situação mudar.
            </p>
          </div>

          {/* Botão Recalcular */}
          <button className="prolabore-btn-recalcular" onClick={reiniciar}>
            <RefreshCw size={15} />
            Recalcular
          </button>
        </div>
      </>
    );
  }

  return null;
}

function BreakdownLinha({
  label,
  valor,
  negativo,
  destaque,
}: {
  label: string;
  valor: number;
  negativo?: boolean;
  destaque?: boolean;
}) {
  const abs = Math.abs(valor);
  const prefixo = negativo ? '- R$ ' : 'R$ ';
  const corValor = negativo ? '#b91c1c' : destaque ? '#003054' : '#374151';

  return (
    <div className={`prolabore-breakdown-linha ${destaque ? 'destaque' : ''}`}>
      <span className="prolabore-breakdown-label">{label}</span>
      <span className="prolabore-breakdown-valor" style={{ color: corValor }}>
        {prefixo}{abs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .prolabore-card {
        background: #fff;
        border: 1.5px solid #ece9e4;
        border-radius: 14px;
        font-family: 'DM Sans', sans-serif;
        overflow: hidden;
      }

      /* ── IDLE ── */
      .prolabore-idle {
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      @media (min-width: 600px) {
        .prolabore-idle {
          flex-direction: row;
          align-items: center;
          gap: 16px;
        }
      }
      .prolabore-idle-icone {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: rgba(0, 48, 84, 0.07);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .prolabore-idle-texto {
        flex: 1;
      }
      .prolabore-idle-titulo {
        font-size: 15px;
        font-weight: 700;
        color: #003054;
        margin-bottom: 4px;
      }
      .prolabore-idle-sub {
        font-size: 13px;
        color: #6b7280;
        line-height: 1.5;
      }

      /* ── FLUXO ── */
      .prolabore-fluxo {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .prolabore-progresso {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .prolabore-progresso-steps {
        display: flex;
        gap: 5px;
      }
      .prolabore-progresso-step {
        width: 28px;
        height: 4px;
        border-radius: 100px;
        background: #e5e7eb;
        transition: background 0.2s;
      }
      .prolabore-progresso-step.ativo {
        background: #003054;
      }
      .prolabore-progresso-texto {
        font-size: 12px;
        color: #9ca3af;
        font-weight: 500;
      }
      .prolabore-pergunta-titulo {
        font-size: 15px;
        font-weight: 600;
        color: #003054;
        line-height: 1.45;
      }
      .prolabore-pergunta-sub {
        font-size: 13px;
        color: #6b7280;
        line-height: 1.5;
        margin-top: -8px;
      }

      /* ── CAMPO ── */
      .prolabore-campo {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .prolabore-campo-label {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .prolabore-campo-input-wrap {
        display: flex;
        align-items: center;
        border: 1.5px solid #d1d5db;
        border-radius: 10px;
        overflow: hidden;
        background: #fff;
        transition: border-color 0.15s;
      }
      .prolabore-campo-input-wrap:focus-within {
        border-color: #003054;
      }
      .prolabore-campo-prefix {
        padding: 10px 12px;
        font-size: 14px;
        color: #9ca3af;
        background: #f9f8f7;
        border-right: 1px solid #e5e7eb;
        flex-shrink: 0;
      }
      .prolabore-campo-input {
        flex: 1;
        padding: 10px 14px;
        font-size: 15px;
        color: #003054;
        font-family: 'DM Sans', sans-serif;
        font-weight: 500;
        border: none;
        outline: none;
        background: transparent;
        min-width: 0;
      }
      .prolabore-campo-input::placeholder { color: #d1d5db; }

      /* ── RADIO ── */
      .prolabore-radio-grupo {
        display: flex;
        gap: 10px;
      }
      .prolabore-radio-btn {
        flex: 1;
        padding: 10px 0;
        border: 1.5px solid #d1d5db;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        color: #6b7280;
        font-family: 'DM Sans', sans-serif;
        background: #fff;
        cursor: pointer;
        transition: all 0.15s;
      }
      .prolabore-radio-btn.ativo {
        border-color: #003054;
        color: #003054;
        background: rgba(0, 48, 84, 0.05);
      }
      .prolabore-radio-btn:hover:not(.ativo) {
        border-color: #9ca3af;
      }

      /* ── NAV ── */
      .prolabore-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 4px;
      }
      .prolabore-btn-primario {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #003054;
        color: #fff;
        padding: 11px 20px;
        border-radius: 10px;
        font-family: 'DM Sans', sans-serif;
        font-size: 14px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: background 0.2s;
        white-space: nowrap;
      }
      .prolabore-btn-primario:hover { background: #004070; }
      .prolabore-btn-voltar {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: #9ca3af;
        font-size: 13px;
        font-weight: 500;
        font-family: 'DM Sans', sans-serif;
        background: none;
        border: none;
        cursor: pointer;
        transition: color 0.15s;
        padding: 0;
      }
      .prolabore-btn-voltar:hover { color: #6b7280; }

      /* ── ERRO ── */
      .prolabore-erro {
        font-size: 12px;
        color: #b91c1c;
        font-weight: 500;
        margin-top: -8px;
      }

      /* ── RESULTADO ── */
      .prolabore-resultado {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .prolabore-alerta-amarelo {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        background: rgba(234, 179, 8, 0.08);
        border: 1px solid rgba(234, 179, 8, 0.3);
        border-radius: 10px;
        padding: 12px 14px;
        font-size: 13px;
        color: #854d0e;
        line-height: 1.5;
      }
      .prolabore-resultado-principal {
        text-align: center;
        padding: 16px 0 8px;
      }
      .prolabore-resultado-label {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 6px;
      }
      .prolabore-resultado-valor {
        font-size: 28px;
        color: #003054;
        font-weight: 400;
        line-height: 1.2;
      }
      .prolabore-resultado-valor strong {
        font-weight: 700;
      }
      .prolabore-resultado-zero {
        font-size: 14px;
        color: #b91c1c;
        font-weight: 600;
        line-height: 1.5;
        padding: 0 12px;
      }
      .prolabore-resultado-contexto {
        font-size: 12px;
        color: #9ca3af;
        margin-top: 6px;
      }

      /* ── BREAKDOWN ── */
      .prolabore-breakdown-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 10px 14px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        background: #f9f8f7;
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
        font-family: 'DM Sans', sans-serif;
        cursor: pointer;
        transition: background 0.15s;
      }
      .prolabore-breakdown-toggle:hover { background: #f0eeea; }
      .prolabore-breakdown {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 14px;
        background: #f9f8f7;
        border-radius: 10px;
        border: 1px solid #e5e7eb;
      }
      .prolabore-breakdown-linha {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .prolabore-breakdown-linha.destaque .prolabore-breakdown-label {
        font-weight: 600;
        color: #003054;
      }
      .prolabore-breakdown-label {
        font-size: 13px;
        color: #6b7280;
      }
      .prolabore-breakdown-valor {
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
      }
      .prolabore-breakdown-divider {
        height: 1px;
        background: #e5e7eb;
        margin: 2px 0;
      }

      /* ── DISCLAIMER ── */
      .prolabore-disclaimer {
        background: rgba(0, 48, 84, 0.03);
        border: 1px solid rgba(0, 48, 84, 0.08);
        border-radius: 10px;
        padding: 12px 14px;
        font-size: 12px;
        color: #9ca3af;
        line-height: 1.6;
        font-style: italic;
      }

      /* ── RECALCULAR ── */
      .prolabore-btn-recalcular {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        background: none;
        border: 1.5px solid #d1d5db;
        border-radius: 10px;
        padding: 9px 16px;
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
        font-family: 'DM Sans', sans-serif;
        cursor: pointer;
        align-self: flex-start;
        transition: all 0.15s;
      }
      .prolabore-btn-recalcular:hover {
        border-color: #003054;
        color: #003054;
      }
    `}</style>
  );
}