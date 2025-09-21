'use client';

import { useEffect, useState } from 'react';
import { getPatient, getScansForPatient } from '@/lib/data';
import type { Patient, LungScan } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ScanDetailsModal } from '@/components/history/scan-details-modal';

export default function PatientHistoryPage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [scans, setScans] = useState<LungScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<LungScan | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const patientData = await getPatient(params.id);
        const scansData = await getScansForPatient(params.id);
        setPatient(patientData);
        setScans(scansData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const getStatusBadge = (hasCancer: boolean) => {
    return hasCancer ? (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancer Detected</Badge>
    ) : (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">No Cancer</Badge>
    );
  };
  
  if (loading) return <PageSkeleton />;

  if (!patient) return <div className="text-center text-muted-foreground">Patient not found.</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Avatar className="h-20 w-20 border">
            <AvatarImage src={patient.avatar} alt={patient.name} />
            <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <p className="text-muted-foreground">ID: {patient.registration_id} &bull; {patient.age} years old &bull; {patient.gender}</p>
            <p className="text-sm mt-2">{patient.medical_history}</p>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>AI Diagnosis</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.map(scan => (
                <TableRow key={scan.id}>
                  <TableCell>{format(new Date(scan.consultation_date), 'MMMM d, yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(scan.ai_analysis.has_cancer)}</TableCell>
                  <TableCell>{scan.ai_analysis.accuracy_percentage}%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedScan(scan)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {selectedScan && (
        <ScanDetailsModal
          scan={selectedScan}
          patient={patient}
          isOpen={!!selectedScan}
          onOpenChange={() => setSelectedScan(null)}
        />
      )}
    </div>
  );
}

function PageSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}
