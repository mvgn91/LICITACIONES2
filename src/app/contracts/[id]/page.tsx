
import { notFound } from 'next/navigation';
import { ContractDetails } from '@/components/contracts/ContractDetails';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ContractPage({ params }: PageProps) {
  if (!params.id) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <ContractDetails contractId={params.id} />
    </div>
  );
}
