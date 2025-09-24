'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LungScan, Patient } from '@/lib/types';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import AnalysisResults from '../scan/analysis-results';
import ModelPredictionsChart from '../scan/model-predictions-chart';


interface ScanDetailsModalProps {
  scan: LungScan;
  patient: Patient;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScanDetailsModal({ scan, patient, isOpen, onOpenChange }: ScanDetailsModalProps) {
  
  const getStatusBadge = (hasCancer: boolean) => {
    return hasCancer ? (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        <AlertTriangle className="mr-2 h-4 w-4" />
        Cancer Detected
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle2 className="mr-2 h-4 w-4" />
        No Cancer
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <ScrollArea className="max-h-[80vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl">Scan Details</DialogTitle>
              <DialogDescription>
                Analysis for {patient.name} from {format(new Date(scan.consultation_date), 'MMMM d, yyyy')}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {scan.scan_image_url ? (
                  <div className="relative aspect-video w-full">
                    <Image
                      src={scan.scan_image_url}
                      alt={`Scan for ${patient.name}`}
                      fill
                      className="rounded-lg object-cover border"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video w-full bg-muted rounded-lg border flex items-center justify-center">
                    <p className="text-muted-foreground">Scan image not available</p>
                  </div>
                )}
                 {scan.ai_analysis.predictions && (
                  <ModelPredictionsChart predictions={scan.ai_analysis.predictions} />
                )}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Doctor's Notes</h3>
                    <p className="text-sm text-muted-foreground">{scan.doctor_notes || "No notes provided."}</p>
                </div>
              </div>
              <AnalysisResults analysis={scan.ai_analysis} />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
