
'use client';

import { useMemo, useState, useCallback } from 'react';
import type { Contrato, Estimacion } from '@/lib/types';
import { ContractListItem } from './ContractListItem';
import { mockContratos } from '@/lib/mock-data';
import { EmptyState } from './EmptyState';

interface ContractListProps {
  searchTerm: string;
  statusFilter: string;
}

export function ContractList({ searchTerm, statusFilter }: ContractListProps) {
  const [contracts, setContracts] = useState<(Contrato & { estimaciones: Omit<Estimacion, 'isCompleted'>[] })[]>(mockContratos);

  const handleAddContract = useCallback((newContract: Contrato) => {
    const newContractWithEstimations = { ...newContract, estimaciones: [] };
    setContracts(prevContracts => [newContractWithEstimations, ...prevContracts]);
  }, []);

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const searchMatch =
        contract.nombre.toLowerCase().includes(lowercasedSearchTerm) ||
        contract.cliente.toLowerCase().includes(lowercasedSearchTerm) ||
        contract.id.toLowerCase().includes(lowercasedSearchTerm);
      
      const statusMatch =
        statusFilter === 'Todos' || contract.estado === statusFilter;
      
      return searchMatch && statusMatch;
    });
  }, [contracts, searchTerm, statusFilter]);

  if (contracts.length === 0) {
    return <EmptyState onAddContract={handleAddContract} />;
  }

  return (
    <div>
      {filteredContracts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContracts.map((contract) => (
              <ContractListItem key={contract.id} contract={contract as Contrato & { estimaciones: Estimacion[]}} />
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
