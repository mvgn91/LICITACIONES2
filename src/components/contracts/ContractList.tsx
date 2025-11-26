'use client';

import { useMemo } from 'react';
import type { Contrato, Estimacion } from '@/lib/types';
import { ContractListItem } from './ContractListItem';

interface ContractListProps {
  contracts: Contrato[];
  searchTerm: string;
  statusFilter: string;
  onContractClick: (contract: Contrato) => void;
  onAddNew: () => void;
}

// --- Contrato de Ejemplo para el Estado de Retención ---
const MOCK_RETENCION_CONTRACT: Contrato & { estimaciones: Estimacion[] } = {
  id: 'mock-retencion-01',
  numero: 'MC-RET-01',
  nombre: 'Contrato de Ejemplo (En Retención)',
  objeto: 'Demostración del flujo de liquidación y retención del 2%.',
  contratante: 'Sistema de Pruebas',
  contratista: 'Usuario',
  cliente: 'Cliente de Prueba',
  montoSinIVA: 86206.90, // 100000 / 1.16
  montoConIVA: 100000.00,
  anticipoPorcentaje: 10,
  anticipoMonto: 10000.00,
  anticipoFecha: '2023-01-15T12:00:00.000Z',
  anticipoEvidencia: null,
  fechaInicio: '2023-01-01T12:00:00.000Z',
  fechaTerminoEstimada: '2023-12-31T12:00:00.000Z',
  estado: 'Retención', // Estado CRUCIAL para la prueba
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  // Estimaciones que suman (junto con el anticipo) el 98% del total
  estimaciones: [
    {
      id: 'est-mock-01',
      contrato_id: 'mock-retencion-01',
      numero: 1,
      monto: 88000.00, // Pagos = 10k (anticipo) + 88k (estimación) = 98k
      fecha: '2023-10-15T12:00:00.000Z',
      tipo: 'Liquidación',
      observaciones: 'Estimación que alcanza el 98% del contrato.',
      evidencia: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
};
// --- Fin del Contrato de Ejemplo ---

export function ContractList({ contracts, searchTerm, statusFilter, onContractClick, onAddNew }: ContractListProps) {
  
  const allContracts = useMemo(() => {
    // Inyectamos el contrato de ejemplo en la lista
    return [MOCK_RETENCION_CONTRACT, ...contracts];
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    if (!allContracts) return [];
    return allContracts.filter((contract) => {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const searchMatch =
        (contract.nombre && contract.nombre.toLowerCase().includes(lowercasedSearchTerm)) ||
        (contract.cliente && contract.cliente.toLowerCase().includes(lowercasedSearchTerm)) ||
        (contract.id && contract.id.toString().toLowerCase().includes(lowercasedSearchTerm));
      
      const statusMatch =
        statusFilter === 'Todos' || contract.estado === statusFilter;
      
      return searchMatch && statusMatch;
    });
  }, [allContracts, searchTerm, statusFilter]);

  // Se ajusta la condición para considerar la lista combinada
  if (allContracts.length === 1 && allContracts[0].id === 'mock-retencion-01' && contracts.length === 0) {
    return (
        <div className="text-center py-16 text-muted-foreground bg-background rounded-lg border-2 border-dashed flex flex-col items-center">
            <h3 className="text-xl font-semibold">Aún no hay contratos reales</h3>
            <p className="mt-2 mb-4">Haz clic en "Agregar Contrato" para empezar. Mientras, puedes usar el contrato de ejemplo.</p>
        </div>
    );
  }

  if (filteredContracts.length === 0) {
     return (
        <div className="text-center py-16 text-muted-foreground bg-background rounded-lg border">
          <h3 className="text-xl font-semibold">No se Encontraron Contratos</h3>
          <p className="mt-2">Intenta ajustar tu búsqueda o filtro. Prueba con el estado "Retención" para ver el contrato de ejemplo.</p>
        </div>
      );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContracts.map((contract) => (
          <ContractListItem 
            key={contract.id} 
            contract={contract as Contrato & { estimaciones: Estimacion[]}} 
            onClick={() => onContractClick(contract)}
          />
        ))}
    </div>
  );
}
