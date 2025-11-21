'use client';

import { useMemo, useState } from 'react';
import { EmptyState } from './EmptyState';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Contrato, Estimacion } from '@/lib/types';
import { ContractListItem } from './ContractListItem';
import { mockContratos } from '@/lib/mock-data';

export function ContractList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  
  // Use mock data instead of Firebase
  const contracts = mockContratos;
  const isLoading = false;

  const filteredContracts = useMemo(() => {
    if (!contracts) return [];
    
    return contracts.filter((contract) => {
      const searchMatch =
        contract.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.cliente.toLowerCase().includes(searchTerm.toLowerCase());
      
      const statusMatch =
        statusFilter === 'Todos' || contract.estado === statusFilter;
      
      return searchMatch && statusMatch;
    });
  }, [contracts, searchTerm, statusFilter]);

  if (isLoading) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <div className="h-10 w-64 bg-muted animate-pulse rounded-md" />
                <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
            </div>
            <div className="h-24 w-full bg-muted animate-pulse rounded-md" />
            <div className="h-24 w-full bg-muted animate-pulse rounded-md" />
            <div className="h-24 w-full bg-muted animate-pulse rounded-md" />
        </div>
    );
  }

  if (!contracts || contracts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <Input
            placeholder="Buscar por nombre o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Cerrado">Cerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredContracts.length > 0 ? (
        <div className="border rounded-lg">
          <div className="divide-y divide-border">
            {filteredContracts.map((contract) => (
              <ContractListItem key={contract.id} contract={contract as Contrato & { estimaciones: Estimacion[]}} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <h3 className="text-xl font-semibold">No se encontraron contratos</h3>
          <p>Intenta ajustar tu búsqueda o filtro.</p>
        </div>
      )}
    </div>
  );
}
