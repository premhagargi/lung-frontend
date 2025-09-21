'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPatients } from '@/lib/data';
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
import { ArrowRight } from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      const data = await getPatients('1'); // Assuming doctor '1' is logged in
      setPatients(data);
      setLoading(false);
    };
    loadPatients();
  }, []);

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
  );
}
