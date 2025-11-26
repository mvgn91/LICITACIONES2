
'use client';

import { useMemo } from 'react';
import type { Contrato, Estimacion } from '@/lib/types';
import { ContractListItem } from './ContractListItem';
import { EmptyState } from './EmptyState';

interface ContractListProps {
  contracts: Contrato[];
  searchTerm: string;
  statusFilter: string;
  onContractClick: (contract: Contrato) => void;
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
    return <EmptyState />;
  }

  return (
    <div>
      {filteredContracts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContracts.map((contract) => (
              <ContractListItem 
                key={contract.id} 
                contract={contract as Contrato & { estimaciones: Estimacion[]}} 
                onClick={() => onContractClick(contract)}
              />
            ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground bg-background rounded-lg border">
          <h3 className="text-xl font-semibold">No se Encontraron Contratos</h3>
          <p className="mt-2">Intenta ajustar tu búsqueda o filtro para encontrar lo que buscas.</p>
        </div>
      )}
    </div>
  );
}
