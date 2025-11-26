
'use client';

import React from 'react';
import type { Contrato } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { EstimacionesTab } from './EstimacionesTab';
import { ApprovalFlow } from './ApprovalFlow';
import { EditContractModal } from './EditContractModal'; // <-- 1. Importar el modal de edición

// --- Componente de Tarjeta de Estadística ---
const FinancialStatCard: React.FC<{ title: string; value: string; icon: React.ElementType; }> = ({ title, value, icon: Icon }) => (
  <Card className="p-4">
    <div className="flex items-center">
      <Icon className="h-6 w-6 mr-3 text-muted-foreground" />
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold font-mono">{value}</p>
      </div>
    </div>
  </Card>
);

// --- Props del Modal ---
interface ContractDetailsModalProps {
  contract: Contrato | null;
  isOpen: boolean;
  onClose: () => void;
  onContractUpdated: (updatedContract: Contrato) => void; // <-- 2. Prop para refrescar la lista
}

// --- COMPONENTE PRINCIPAL ---
export function ContractDetailsModal({ contract, isOpen, onClose, onContractUpdated }: ContractDetailsModalProps) {

  if (!contract) return null;

  const montoTotal = parseFloat(String(contract.montoConIVA)) || 0;
  const montoBase = parseFloat(String(contract.montoBase)) || 0;
  const anticipo = parseFloat(String(contract.anticipoMonto)) || 0;
  const ivaAmount = montoTotal - montoBase;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0">
        <div className="max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex justify-between items-start">
                <div>
                    <DialogTitle className="text-2xl font-bold">{contract.nombre}</DialogTitle>
                    <DialogDescription>{contract.cliente}</DialogDescription>
                </div>
                {/* --- 3. Botón de Edición Integrado --- */}
                <EditContractModal contract={contract} onContractUpdated={onContractUpdated} /> 
            </div>
          </DialogHeader>

          <Tabs defaultValue="resumen" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 h-auto rounded-none">
              <TabsTrigger value="resumen" className="py-3">Resumen Financiero</TabsTrigger>
              <TabsTrigger value="estimaciones" className="py-3">Estimaciones</TabsTrigger>
              <TabsTrigger value="aprobacion" className="py-3">Flujo de Aprobación</TabsTrigger>
            </TabsList>
            
            {/* PESTAÑA 1: RESUMEN FINANCIERO */}
            <TabsContent value="resumen" className="p-6">
              <Card>
                <CardHeader><CardTitle>Detalles del Contrato</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FinancialStatCard title="Monto Base" value={formatCurrency(montoBase)} icon={Wallet} />
                  <FinancialStatCard title="I.V.A. (16%)" value={formatCurrency(ivaAmount)} icon={Percent} />
                  <FinancialStatCard title="Monto Total" value={formatCurrency(montoTotal)} icon={TrendingUp} />
                  <FinancialStatCard title="Anticipo Pagado" value={formatCurrency(anticipo)} icon={TrendingDown} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* PESTAÑA 2: ESTIMACIONES */}
            <TabsContent value="estimaciones" className="p-6">
              <EstimacionesTab contract={contract} />
            </TabsContent>

            {/* PESTAÑA 3: FLUJO DE APROBACIÓN */}
            <TabsContent value="aprobacion" className="p-6">
              <ApprovalFlow contract={contract} />
            </TabsContent>

          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
