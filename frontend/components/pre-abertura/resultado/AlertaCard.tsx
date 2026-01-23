"use client";

import { AlertaResponse } from "@/types/pre_abertura";

interface AlertaCardProps {
  alerta: AlertaResponse;
}

export default function AlertaCard({ alerta }: AlertaCardProps) {
  // Configuração visual por categoria
  const getConfig = () => {
    if (alerta.severidade === "positivo") {
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        titleColor: "text-green-800",
        textColor: "text-green-700",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      };
    }

    switch (alerta.categoria) {
      case "financeiro":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          titleColor: "text-red-800",
          textColor: "text-red-700",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case "operacional":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
          titleColor: "text-yellow-800",
          textColor: "text-yellow-700",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
      case "estrutural":
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          titleColor: "text-blue-800",
          textColor: "text-blue-700",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };

  const config = getConfig();

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl p-4`}>
      <div className="flex gap-4">
        <div className={`${config.iconBg} ${config.iconColor} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
          {config.icon}
        </div>
        <div>
          <h4 className={`font-semibold ${config.titleColor} mb-1`}>
            {alerta.titulo}
          </h4>
          <p className={`text-sm ${config.textColor}`}>
            {alerta.texto}
          </p>
        </div>
      </div>
    </div>
  );
}
