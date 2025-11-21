
'use client';

import { useUser } from '@/firebase';
import { ContractList } from '@/components/contracts/ContractList';
import { EmptyState } from '@/components/contracts/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';


export default function Page() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
       <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Contratos</h1>
         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3 rounded-lg border bg-card p-6">
                  <Skeleton className="h-6 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                  <div className="flex-grow pt-4 space-y-4">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-5/6 rounded" />
                  </div>
                  <div className="space-y-2 pt-4">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
              </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <EmptyState />;
  }

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Contratos</h1>
      <ContractList userId={user.uid} />
    </div>
  );
}
