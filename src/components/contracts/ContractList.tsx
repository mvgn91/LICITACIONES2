
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

export function ContractList({ contracts, searchTerm, statusFilter, onContractClick }: ContractListProps) {
  
  const filteredContracts = useMemo(() => {
    if (!contracts) return [];
    return contracts.filter((contract) => {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const searchMatch =
        (contract.nombre && contract.nombre.toLowerCase().includes(lowercasedSearchTerm)) ||
        (contract.cliente && contract.cliente.toLowerCase().includes(lowercasedSearchTerm)) ||
        (contract.id && contract.id.toString().toLowerCase().includes(lowercasedSearchTerm));
      
      const statusMatch =
        statusFilter === 'Todos' || contract.estado === statusFilter;
      
      return searchMatch && statusMatch;
    });
  }, [contracts, searchTerm, statusFilter]);

  if (contracts.length === 0) {
    return (
        <div className="text-center py-16 text-muted-foreground bg-background rounded-lg border-2 border-dashed flex flex-col items-center">
            <h3 className="text-xl font-semibold">Aún no hay contratos</h3>
            <p className="mt-2 mb-4">Haz clic en "Agregar Contrato" para empezar.</p>
        </div>
    );
  }

  if (filteredContracts.length === 0) {
     return (
        <div className="text-center py-16 text-muted-foreground bg-background rounded-lg border">
          <h3 className="text-xl font-semibold">No se Encontraron Contratos</h3>
          <p className="mt-2">Intenta ajustar tu búsqueda o filtro.</p>
        </div>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
