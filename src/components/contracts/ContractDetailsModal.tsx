
'use client';

import React from 'react';
import type { Contrato } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EstimacionesTab } from './EstimacionesTab';

interface ContractDetailsModalProps {
  contract: Contrato | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ContractDetailsModal({ contract, isOpen, onClose }: ContractDetailsModalProps) {
  if (!contract) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{contract.nombre}</DialogTitle>
          <DialogDescription>
            Cliente: {contract.cliente} - Estado: <span className={`font-semibold ${contract.estado === 'Activo' ? 'text-green-500' : contract.estado === 'Pendiente' ? 'text-yellow-500' : 'text-gray-500'}`}>{contract.estado}</span>
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="pt-4">
          <TabsList>
            <TabsTrigger value="details">Detalles del Contrato</TabsTrigger>
            <TabsTrigger value="estimates">Estimaciones</TabsTrigger>
            <TabsTrigger value="approval">Flujo de Aprobación</TabsTrigger>
            <TabsTrigger value="payments">Histórico de Pagos</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="pt-4">
             {/* Aquí irán los detalles completos del contrato */}
            <div className="grid grid-cols-2 gap-4">
                <p><strong>Monto Total (con IVA):</strong> ${contract.monto_total?.toLocaleString()}</p>
                <p><strong>Fecha de Inicio:</strong> {new Date(contract.fecha_inicio!).toLocaleDateString()}</p>
                <p><strong>Fecha de Término Estimada:</strong> {new Date(contract.fecha_termino_estimada!).toLocaleDateString()}</p>
                <p><strong>Anticipo:</strong> ${contract.anticipo_monto?.toLocaleString()}</p>
                <p><strong>Fecha de Anticipo:</strong> {new Date(contract.anticipo_fecha!).toLocaleDateString()}</p>
            </div>
          </TabsContent>

          <TabsContent value="estimates" className="pt-4">
            <EstimacionesTab contract={contract} />
          </TabsContent>

          <TabsContent value="approval" className="pt-4">
            <p>El flujo de aprobación para las estimaciones aparecerá aquí.</p>
          </TabsContent>

          <TabsContent value="payments" className="pt-4">
            <p>El historial de pagos para este contrato aparecerá aquí.</p>
          </TabsContent>
        </Tabs>

      </DialogContent>
    </Dialog>
  );
}
