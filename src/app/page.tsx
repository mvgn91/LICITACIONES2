'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Contrato } from '@/lib/types';
import { ContractList } from '@/components/contracts/ContractList';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddContractModal } from '@/components/contracts/AddContractModal';
import { ContractDetailsModal } from '@/components/contracts/ContractDetailsModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function Page() {
  // --- STATE MANAGEMENT ---
  const [contracts, setContracts] = useState<Contrato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  
  // State for modals
  const [selectedContract, setSelectedContract] = useState<Contrato | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- DATA FETCHING ---
  const fetchContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/contratos');
      if (!response.ok) {
        throw new Error(`Failed to fetch contracts. Status: ${response.status}`);
      }
      const data = await response.json();
      setContracts(data.contratos || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // --- HANDLERS ---
  const handleAddContractSuccess = useCallback(() => {
    fetchContracts(); // Refresca la lista de contratos
    setIsAddModalOpen(false); // Cierra el modal de agregar
  }, [fetchContracts]);

  const handleContractClick = (contract: Contrato) => {
    setSelectedContract(contract);
  };

  const handleCloseDetailsModal = () => {
    setSelectedContract(null);
  };

  // --- RENDER ---
  return (
    <>
      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        {/* Header con título y botón único */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-foreground">Panel de Contratos</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Contrato
          </Button>
        </div>

        {/* Filtros de búsqueda y estado */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full flex-grow">
            <Input
              type="text"
              placeholder="Buscar por nombre, cliente o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contenido principal: Skeleton o Lista de Contratos */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-lg" />)}
          </div>
        ) : (
          <ContractList 
            contracts={contracts} 
            searchTerm={searchTerm} 
            statusFilter={statusFilter} 
            onContractClick={handleContractClick} 
            onAddNew={() => setIsAddModalOpen(true)} // Conectado al estado del modal
          />
        )}
      </div>

      {/* Modals */}
      <ContractDetailsModal 
        contract={selectedContract}
        isOpen={!!selectedContract}
        onClose={handleCloseDetailsModal}
      />

      <AddContractModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddContract={handleAddContractSuccess}
      />
    </>
  );
}
