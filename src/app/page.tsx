'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDoctor, getPatients, getRecentScans, getAllScansForDoctor } from '@/lib/data';
import type { Doctor, Patient, LungScan } from '@/lib/types';
import WelcomeHeader from '@/components/dashboard/welcome-header';
import StatsCards from '@/components/dashboard/stats-cards';
import RecentScans from '@/components/dashboard/recent-scans';
import RecentActivity from '@/components/dashboard/recent-activity';
import DoctorOnboarding from '@/components/dashboard/doctor-onboarding';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [scans, setScans] = useState<LungScan[]>([]);
  const [allScans, setAllScans] = useState<LungScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      const fetchData = async () => {
        try {
          const doctorData = await getDoctor(user.uid);
          const patientsData = await getPatients(doctorData.id);
          const allScansData = await getAllScansForDoctor(doctorData.id);
          const recentScansData = allScansData.slice(0, 10); // Show more scans on dashboard

          setDoctor(doctorData);
          setPatients(patientsData);
          setAllScans(allScansData);
          setScans(recentScansData);

          if (!doctorData.is_profile_complete) {
            setOnboardingOpen(true);
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
          setDoctor(null);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user, authLoading, router]);

  const handleOnboardingComplete = (updatedDoctor: Doctor) => {
    setDoctor(updatedDoctor);
    setOnboardingOpen(false);
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-2xl font-bold text-muted-foreground">Unable to load dashboard</h2>
        <p className="text-muted-foreground">There was an error loading your doctor profile.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate average accuracy from all scans
  const averageAccuracy = allScans.length > 0
    ? allScans.reduce((sum, scan) => sum + scan.ai_analysis.accuracy_percentage, 0) / allScans.length
    : undefined;

  return (
    <div className="flex flex-col gap-8">
      {!doctor.is_profile_complete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Complete Your Profile</h3>
          <p className="text-yellow-700 mb-4">Please complete your professional profile to get the best experience.</p>
          <button
            onClick={() => setOnboardingOpen(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Complete Profile
          </button>
        </div>
      )}
      <DoctorOnboarding
        doctor={doctor}
        isOpen={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        onProfileUpdate={handleOnboardingComplete}
      />
      <WelcomeHeader name={doctor.name} />
      <StatsCards stats={{ scans: allScans.length, patients: patients.length, accuracy: averageAccuracy }} />
      <div className="grid gap-6 md:grid-cols-2">
        <RecentScans scans={scans} patients={patients} />
        <RecentActivity patients={patients} scans={allScans} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
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
