'use client';

import React, { useState, useMemo } from 'react';
import type { Contrato, Estimacion } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CierreContrato } from './CierreContrato';
import { LiberacionGarantia } from './LiberacionGarantia';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, Trash2 } from 'lucide-react';

// --- Mock de datos y tipos ---
type EvidenciaFile = { id: string; name: string };
const MOCK_FASE1_FILES: EvidenciaFile[] = [{ id: 'f1-001', name: 'documentos_constructora.zip' }];
const MOCK_FASE2_FILES: EvidenciaFile[] = [{ id: 'f2-001', name: 'vobo_presupuestos.pdf' }];

// --- Componente de Checklist (simple, sin carga individual) ---
const ChecklistItem = ({ id, label, checked, onCheckedChange }: { id: string; label: string; checked: boolean; onCheckedChange: (checked: boolean) => void; }) => (
    <div className="flex items-center space-x-3 py-2">
        <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
        <Label htmlFor={id} className="text-sm font-medium text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</Label>
    </div>
);

// --- Componente para una Fase con Checklist y Carga Unificada ---
const PhaseCard = ({ title, checklistItems, files, onUpload }: { title: string; checklistItems: React.ReactNode; files: EvidenciaFile[]; onUpload: () => void; }) => (
    <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent>
            <div className="space-y-2">{checklistItems}</div>
            <div className="my-6 border-t border-dashed" />
            <div>
                <h4 className="text-sm font-semibold mb-3 text-foreground">Evidencia de la Fase</h4>
                <div className="space-y-3">
                    {files.length > 0 ? (
                        files.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md border">
                                <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-muted-foreground" /><span className="text-sm font-medium">{file.name}</span></div>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-md"><p>No hay archivos cargados.</p></div>
                    )}
                </div>
                <div className="mt-4 text-center"><Button onClick={onUpload}><Upload className="h-4 w-4 mr-2"/>Cargar Archivos</Button></div>
            </div>
        </CardContent>
    </Card>
);

// --- Componente Principal ---
export function ApprovalFlow({ contract }: { contract: Contrato & { estimaciones?: Estimacion[] } }) {
    const [isFlowActive, setIsFlowActive] = useState(false);
    const [terminationInfo, setTerminationInfo] = useState<{ fecha: Date } | null>(null);

    const [fase1Checks, setFase1Checks] = useState({ cat: false, pu: false, caratula: false });
    const [fase2Checks, setFase2Checks] = useState({ vobo: false });
    const [fase1Files, setFase1Files] = useState<EvidenciaFile[]>([]);
    const [fase2Files, setFase2Files] = useState<EvidenciaFile[]>([]);

    const { showTerminationFlow, paymentPercentage } = useMemo(() => {
        const montoTotal = parseFloat(String(contract.montoConIVA || 0));
        if (montoTotal === 0) return { showTerminationFlow: false, paymentPercentage: 0 };
        const totalPagado = (contract.estimaciones || []).reduce((acc, est) => acc + parseFloat(String(est.monto)), parseFloat(String(contract.anticipoMonto || 0)));
        const percentage = (totalPagado / montoTotal) * 100;
        return { showTerminationFlow: percentage >= 98, paymentPercentage: percentage };
    }, [contract]);

    return (
        <div className="space-y-8">
            <PhaseCard 
                title="Fase 1: Documentación Constructora" 
                files={fase1Files} 
                onUpload={() => setFase1Files(MOCK_FASE1_FILES)}
                checklistItems={
                    <>
                        <ChecklistItem id="cat" label="Catálogo de Conceptos" checked={fase1Checks.cat} onCheckedChange={(val) => setFase1Checks(p => ({...p, cat: val}))} />
                        <ChecklistItem id="pu" label="Análisis de Precios Unitarios" checked={fase1Checks.pu} onCheckedChange={(val) => setFase1Checks(p => ({...p, pu: val}))} />
                        <ChecklistItem id="caratula" label="Carátula de Contrato Firmada" checked={fase1Checks.caratula} onCheckedChange={(val) => setFase1Checks(p => ({...p, caratula: val}))} />
                    </>
                }
            />
            <PhaseCard 
                title="Fase 2: Vo.Bo. Presupuestal" 
                files={fase2Files} 
                onUpload={() => setFase2Files(MOCK_FASE2_FILES)}
                checklistItems={<ChecklistItem id="vobo" label="Visto Bueno del Depto. de Presupuestos" checked={fase2Checks.vobo} onCheckedChange={(val) => setFase2Checks(p => ({...p, vobo: val}))} />}
            />
            {showTerminationFlow ? (
                <div className="space-y-4 p-4 border-t-4 border-amber-500 rounded-lg bg-background shadow-md">
                    <div className="flex justify-between items-center">
                        <div><h3 className="text-lg font-semibold">Flujo de Terminación Disponible</h3><p className="text-sm text-muted-foreground">El contrato ha cubierto el {paymentPercentage.toFixed(2)}% de su monto total.</p></div>
                        <div className="flex items-center space-x-3"><Label htmlFor="flow-switch" className="font-medium">Activar</Label><Switch id="flow-switch" checked={isFlowActive} onCheckedChange={setIsFlowActive} /></div>
                    </div>
                    {isFlowActive && (
                        <div className="pt-6">
                        {!terminationInfo ? (
                            <CierreContrato contract={contract} onTerminacionConfirmada={(fecha) => setTerminationInfo({ fecha })} />
                        ) : (
                            <LiberacionGarantia contract={contract} fechaTerminacion={terminationInfo.fecha} onRevertirTerminacion={() => setTerminationInfo(null)} />
                        )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center p-8 border-2 border-dashed rounded-lg"><p className="text-muted-foreground font-medium">El Flujo de Terminación se habilitará cuando los pagos cubran el 98% del contrato.</p><p className="text-sm text-muted-foreground mt-2">Progreso actual: <span className="font-bold">{paymentPercentage.toFixed(2)}%</span></p></div>
            )}
        </div>
    );
}
