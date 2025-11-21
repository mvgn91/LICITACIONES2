
'use client';

import { ContractList } from '@/components/contracts/ContractList';

export default function Page() {
  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground font-headline">Panel de Contratos</h1>
      </div>
      <ContractList />
    </div>
  );
}

    