
'use client';

import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Download, GanttChartSquare, ReceiptText, Paperclip } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface PaymentHistoryProps {
  transactions: Transaction[];
}

const TransactionEvidenceButton = ({ evidence }: { evidence?: string[] }) => {
  if (!evidence || evidence.length === 0) {
    return <span className="text-xs text-muted-foreground self-center">N/A</span>;
  }

  if (evidence.length === 1) {
    const evidenceFile = evidence[0];
    return (
      <Button asChild variant="outline" size="sm">
        <a href={`/evidence/${evidenceFile}`} download={evidenceFile} target="_blank" rel="noopener noreferrer">
          <Download className="mr-2 h-4 w-4" />
          Descargar
        </a>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Paperclip className="mr-2 h-4 w-4" />
          Ver ({evidence.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {evidence.map((file, index) => (
          <DropdownMenuItem key={index} asChild>
            <a href={`/evidence/${file}`} download={file} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full cursor-pointer">
              <span>{file}</span>
              <Download className="ml-4 h-4 w-4 text-muted-foreground" />
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PaymentHistory({ transactions }: PaymentHistoryProps) {
  if (transactions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Histórico de Transacciones</CardTitle>
        <CardDescription>Un registro de todos los pagos recibidos para este contrato.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop View: Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-center">Evidencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="mr-3">
                          {transaction.type === 'Anticipo' ? <ReceiptText className="h-5 w-5 text-muted-foreground" /> : <GanttChartSquare className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.type}</p>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell className="text-center"><TransactionEvidenceButton evidence={transaction.evidence} /></TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View: Cards */}
        <div className="space-y-4 md:hidden">
            {transactions.map(transaction => (
                <div key={transaction.id} className="p-3 border rounded-lg bg-background">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start mr-3">
                            <div className="mr-3 pt-0.5">
                                {transaction.type === 'Anticipo' ? <ReceiptText className="h-5 w-5 text-muted-foreground" /> : <GanttChartSquare className="h-5 w-5 text-muted-foreground" />}
                            </div>
                            <div>
                                <p className="font-medium">{transaction.type}</p>
                                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                                <p className="text-sm text-muted-foreground mt-1">{formatDate(transaction.date)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <p className="font-semibold text-lg">{formatCurrency(transaction.amount)}</p>
                        <TransactionEvidenceButton evidence={transaction.evidence} />
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
