import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import type { LungScan, Patient } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface RecentScansProps {
  scans: LungScan[];
  patients: Patient[];
}

export default function RecentScans({ scans, patients }: RecentScansProps) {
  const getPatientForScan = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('');
  };

  const getStatusBadge = (hasCancer: boolean) => {
    if (hasCancer) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          Cancer Detected
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
        No Cancer
      </Badge>
    );
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle className='font-normal'>Recent Scans</CardTitle>
          <CardDescription>
            An overview of the most recent analyses performed.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/patients">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No scans performed yet.</p>
            <Button asChild size="sm">
              <Link href="/patients">
                Register Patients to Start
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.map(scan => {
                const patient = getPatientForScan(scan.patient_id);
                if (!patient) return null;
                return (
                  <TableRow key={scan.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={patient.avatar} alt={patient.name} />
                          <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.registration_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {getStatusBadge(scan.ai_analysis.has_cancer)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDistanceToNow(new Date(scan.consultation_date), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
