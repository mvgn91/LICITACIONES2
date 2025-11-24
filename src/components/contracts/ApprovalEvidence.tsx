
'use client';

import { useState, useRef } from 'react';
import { Paperclip, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ApprovalEvidenceProps {
  evidence: string[] | undefined;
  onAddEvidence: (files: File[]) => void;
}

export function ApprovalEvidence({ evidence, onAddEvidence }: ApprovalEvidenceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddEvidence(Array.from(e.target.files));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 ml-2">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={triggerFileInput} className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            <span>Subir Evidencia</span>
          </DropdownMenuItem>
          {evidence && evidence.length > 0 && <DropdownMenuSeparator />}
          {evidence?.map((file, index) => (
            <DropdownMenuItem key={index} asChild>
              <a
                href={`/evidence/${file}`}
                download={file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full cursor-pointer"
              >
                <span className="truncate max-w-[200px]">{file}</span>
                <Download className="ml-4 h-4 w-4 text-muted-foreground flex-shrink-0" />
              </a>
            </DropdownMenuItem>
          ))}
          {(!evidence || evidence.length === 0) && (
              <DropdownMenuItem disabled>
                <span className="text-xs text-muted-foreground">No hay evidencia</span>
              </DropdownMenuItem>
            )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
