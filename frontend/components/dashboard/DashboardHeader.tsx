// components/dashboard/DashboardHeader.tsx
// Header com identificação da empresa - Estilo Premium

import { Building2, Mail, MapPin, CalendarDays } from 'lucide-react';
import { EmpresaInfo } from '@/types/dashboard';

interface DashboardHeaderProps {
  empresa: EmpresaInfo;
}

export default function DashboardHeader({ empresa }: DashboardHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border/40 p-8 mb-6 hover:shadow-md transition duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Info Principal */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary">{empresa.nome}</h1>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground ml-1">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{empresa.email}</span>
          </div>
        </div>

        {/* Info Secundária */}
        <div className="flex flex-col sm:flex-row gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{empresa.estado} • {empresa.setor}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>Referência: {empresa.mes_referencia}/{empresa.ano_referencia}</span>
          </div>
        </div>
      </div>
    </div>
  );
}