
'use client';

import { FilePlus } from 'lucide-react';

// El botón para añadir contratos ahora se muestra en la página principal (page.tsx),
// por lo que este componente ya no necesita un manejador onAddContract.
// Su única responsabilidad es mostrar un mensaje cuando no hay contratos.
export function EmptyState() {
  return (
    <div className="text-center py-16 text-muted-foreground bg-background rounded-lg border-2 border-dashed">
      <div className="inline-block bg-secondary p-4 rounded-full">
          <FilePlus className="h-8 w-8" />
      </div>
      <h3 className="mt-6 text-xl font-semibold">No Hay Contratos Aún</h3>
      <p className="mt-2">Parece que no has añadido ningún contrato. ¡Crea el primero para empezar!</p>
    </div>
  );
}
