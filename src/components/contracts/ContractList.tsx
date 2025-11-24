
'use client';

import { useMemo } from 'react';
import type { Contrato, Estimacion } from '@/lib/types';
import { ContractListItem } from './ContractListItem';
import { EmptyState } from './EmptyState';

interface ContractListProps {
  contracts: Contrato[];
  searchTerm: string;
  statusFilter: string;
}

export function ContractList({ contracts, searchTerm, statusFilter }: ContractListProps) {
  
  const filteredContracts = useMemo(() => {
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
    // EmptyState ya no necesita manejar la adición de contratos aquí.
    // Se podría pasar una función si se quisiera, pero el modal ahora vive en la página principal.
    return <EmptyState onAddContract={() => {}} />;
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
