
'use client';

import { useState } from 'react';
import { ContractList } from '@/components/contracts/ContractList';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-foreground font-headline">Panel de Contratos</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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
      </div>
      <ContractList searchTerm={searchTerm} statusFilter={statusFilter} />
    </div>
  );
}
