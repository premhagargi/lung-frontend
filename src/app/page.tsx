'use client';

import { useEffect, useState } from 'react';
import { getDoctor, getPatients, getRecentScans } from '@/lib/data';
import type { Doctor, Patient, LungScan } from '@/lib/types';
import WelcomeHeader from '@/components/dashboard/welcome-header';
import StatsCards from '@/components/dashboard/stats-cards';
import RecentScans from '@/components/dashboard/recent-scans';
import DoctorOnboarding from '@/components/dashboard/doctor-onboarding';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [scans, setScans] = useState<LungScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const doctorData = await getDoctor('1'); // Simulate fetching logged-in doctor
      const patientsData = await getPatients(doctorData.id);
      const scansData = await getRecentScans(doctorData.id, 5);
      
      setDoctor(doctorData);
      setPatients(patientsData);
      setScans(scansData);
      
      if (!doctorData.is_profile_complete) {
        setOnboardingOpen(true);
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleOnboardingComplete = (updatedDoctor: Doctor) => {
    setDoctor(updatedDoctor);
    setOnboardingOpen(false);
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!doctor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <DoctorOnboarding 
        doctor={doctor} 
        isOpen={onboardingOpen} 
        onOpenChange={setOnboardingOpen}
        onProfileUpdate={handleOnboardingComplete}
      />
      <WelcomeHeader name={doctor.name} />
      <StatsCards stats={{ scans: scans.length, patients: patients.length }} />
      <RecentScans scans={scans} patients={patients} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/5" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}
