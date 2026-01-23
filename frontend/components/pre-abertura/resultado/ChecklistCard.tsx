"use client";

import { useState } from "react";
import { ItemChecklistResponse } from "@/types/pre_abertura";

interface ChecklistCardProps {
  itens: ItemChecklistResponse[];
}

export default function ChecklistCard({ itens }: ChecklistCardProps) {
  const [marcados, setMarcados] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setMarcados((prev) => {
      const novo = new Set(prev);
      if (novo.has(index)) {
        novo.delete(index);
      } else {
        novo.add(index);
      }
      return novo;
    });
  };

  const totalMarcados = marcados.size;
  const totalItens = itens.length;
  const progresso = totalItens > 0 ? (totalMarcados / totalItens) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Checklist: primeiros 30 dias
        </h3>
        <span className="text-sm text-foreground-muted">
          {totalMarcados}/{totalItens} concluídos
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progresso}%` }}
        />
      </div>

      {/* Lista de itens */}
      <ul className="space-y-3">
        {itens.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-start gap-3 text-left group"
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  marcados.has(index)
                    ? "bg-primary border-primary"
                    : "border-gray-300 group-hover:border-primary"
                }`}
              >
                {marcados.has(index) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm transition-all ${
                  marcados.has(index)
                    ? "text-foreground-muted line-through"
                    : "text-foreground"
                }`}
              >
                {item.texto}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Dica */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-sm text-foreground-muted">
          <strong>Dica:</strong> Procure uma empresa de contabilidade especializada no seu setor para ajudar na abertura.
        </p>
      </div>
    </div>
  );
}
