import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AddContractModal } from './AddContractModal';

interface EmptyStateProps {
  error?: string;
}

export function EmptyState({ error }: EmptyStateProps) {
  const image = PlaceHolderImages.find((img) => img.id === 'empty-state');

  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
      <div className="flex max-w-lg flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-12 text-center shadow-sm">
        {image && !error && (
          <Image
            src={image.imageUrl}
            alt={image.description}
            width={400}
            height={267}
            className="mb-6 rounded-lg object-cover"
            data-ai-hint={image.imageHint}
            priority
          />
        )}
        {error ? (
          <div className="text-red-500">
            <h2 className="font-headline text-2xl font-semibold tracking-tight">Error</h2>
            <p className="mt-2">{error}</p>
          </div>
        ) : (
          <>
            <h2 className="font-headline text-2xl font-semibold tracking-tight">
              Aún no hay contratos
            </h2>
            <p className="mt-2 text-muted-foreground">
              Comienza creando tu primer contrato.
            </p>
            <div className="mt-6">
              <AddContractModal />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
