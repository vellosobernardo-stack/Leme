"use client";

import { Shield, Lock, Eye, FileCheck } from "lucide-react";

export function Security() {
  const items = [
    {
      icon: Lock,
      title: "Dados criptografados",
      description: "Proteção de ponta a ponta em todas as suas informações."
    },
    {
      icon: Eye,
      title: "Sem acesso de terceiros",
      description: "Seus dados nunca são compartilhados ou vendidos."
    },
    {
      icon: FileCheck,
      title: "Conforme a LGPD",
      description: "Seguimos todas as diretrizes da lei brasileira."
    }
  ];

  return (
    <section className="py-12 bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        
        {/* Card principal - mais compacto */}
        <div className="bg-[#112d4e] rounded-2xl p-6 lg:p-8 shadow-lg">
          
          {/* Header do card */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-lg bg-[#F5793B]/10 border border-[#F5793B]/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#F5793B]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Seus dados protegidos</h2>
              <p className="text-white/50 text-sm">Suas informações financeiras são suas. E só suas.</p>
            </div>
          </div>

          {/* Grid de itens */}
          <div className="grid md:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <div 
                key={index}
                className="flex flex-col items-center text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <item.icon className="w-4 h-4 text-[#F5793B]" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}