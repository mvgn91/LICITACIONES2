
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Contrato } from '@/lib/types';
import { ContractList } from '@/components/contracts/ContractList';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddContractModal } from '@/components/contracts/AddContractModal';
import { Skeleton } from '@/components/ui/skeleton';

export default function Page() {
  const [contracts, setContracts] = useState<Contrato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/contratos');
        if (!response.ok) {
          throw new Error('Failed to fetch contracts');
        }
        const data = await response.json();
        setContracts(data.contratos || []);
      } catch (error) {
        console.error(error);
        // Aquí podrías manejar el estado de error, por ejemplo, mostrando un toast
      } finally {
        setIsLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const handleAddContract = useCallback((newContract: Contrato) => {
    setContracts(prevContracts => [newContract, ...prevContracts]);
  }, []);

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-foreground font-headline">Panel de Contratos</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
           <AddContractModal onAddContract={handleAddContract} />
        </div>
      </div>
       <div className="flex justify-between items-center mb-6 gap-4">
          <div className="flex-grow">
            <Input
              type="text"
              placeholder="Buscar por ID, obra o cliente..."
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
                <SelectItem value="Todos">Todos los Estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Cerrado">Cerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      ) : (
        <ContractList contracts={contracts} searchTerm={searchTerm} statusFilter={statusFilter} />
      )}
    </div>
  );
}
