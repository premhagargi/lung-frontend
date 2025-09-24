'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPatients, getDoctor } from '@/lib/data';
import type { Patient } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const doctorData = await getDoctor(user.uid);
        setDoctorId(doctorData.id);
        const patientsData = await getPatients(doctorData.id);
        setPatients(patientsData);
      } catch (error) {
        console.error('Failed to load patients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Button asChild>
          <Link href="/patients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Link>
        </Button>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No patients registered yet.</p>
          <Button asChild>
            <Link href="/patients/new">
              <Plus className="mr-2 h-4 w-4" />
              Register First Patient
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {patients.map(patient => (
            <Card key={patient.id} className="flex flex-col bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={patient.avatar} alt={patient.name} />
                  <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{patient.name}</CardTitle>
                  <CardDescription>{patient.registration_id}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground">
                  <p>
                    {patient.age} years old, {patient.gender}
                  </p>
                  <p className="mt-2 line-clamp-3">{patient.medical_history}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/patients/${patient.id}`}>
                    View History <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
