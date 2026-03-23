// components/dashboard/HistoricoTable.tsx
// Tabela de histórico de análises

import { useState } from 'react';
import Link from 'next/link';
import { History, ExternalLink, TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';
import { AnaliseHistorico } from '@/types/dashboard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface HistoricoTableProps {
  historico: AnaliseHistorico[];
}

function formatarData(dataString: string): string {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getMesAno(analise: AnaliseHistorico): string {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const mes = meses[(Number(analise.mes_referencia) || 1) - 1] ?? '';
  return `${mes}/${analise.ano_referencia ?? ''}`;
}

export default function HistoricoTable({ historico: historicoInicial }: HistoricoTableProps) {
  const [historico, setHistorico] = useState(historicoInicial);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [arquivandoId, setArquivandoId] = useState<string | null>(null);

  const getVariacao = (index: number): number | null => {
    if (index >= historico.length - 1) return null;
    return historico[index].score - historico[index + 1].score;
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'saudavel': return 'bg-green-100 text-green-700';
      case 'atencao':  return 'bg-yellow-100 text-yellow-700';
      case 'critico':  return 'bg-red-100 text-red-700';
      default:         return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'saudavel': return 'Saudável';
      case 'atencao':  return 'Atenção';
      case 'critico':  return 'Crítico';
      default:         return status;
    }
  };

  const handleArquivar = async (id: string) => {
    setArquivandoId(id);
    try {
      const response = await fetch(`${API_BASE}/api/v1/historico/${id}/arquivar`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (response.ok) {
        setHistorico((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Erro ao arquivar análise:', err);
    } finally {
      setArquivandoId(null);
      setConfirmandoId(null);
    }
  };

  if (historico.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-border/40 p-8 text-center">
        <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhuma análise anterior encontrada.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border/40 overflow-hidden hover:shadow-md transition duration-300">
      {/* Header */}
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-primary">Suas Análises</h3>
            <p className="text-sm text-muted-foreground">{historico.length} análises realizadas</p>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Referência</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Variação</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {historico.map((analise, index) => {
              const variacao = getVariacao(index);
              const confirmando = confirmandoId === analise.id;
              const arquivando = arquivandoId === analise.id;

              return (
                <tr key={analise.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{formatarData(analise.data)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{analise.mes_referencia}</td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-bold text-primary">{analise.score}</span>
                  </td>
                  <td className="px-6 py-4">
                    {variacao !== null ? (
                      <div className="flex items-center gap-1">
                        {variacao > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : variacao < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          variacao > 0 ? 'text-green-600' : variacao < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {variacao > 0 ? '+' : ''}{variacao} pts
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(analise.status)}`}>
                      {getStatusLabel(analise.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {confirmando ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 whitespace-nowrap">
                          Remover análise de {getMesAno(analise)}?{' '}
                          <span className="text-xs text-gray-400">Os dados ficam salvos.</span>
                        </span>
                        <button
                          onClick={() => setConfirmandoId(null)}
                          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleArquivar(analise.id)}
                          disabled={arquivando}
                          className="px-2 py-1 text-xs text-white bg-red-500 hover:bg-red-600 rounded disabled:opacity-50"
                        >
                          {arquivando ? '...' : 'Remover'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/${analise.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground hover:text-primary inline-block"
                          title="Ver análise completa"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setConfirmandoId(analise.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                          title="Remover do histórico"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}