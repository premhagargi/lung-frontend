'use client';

import { AppHeader } from "@/components/layout/app-header";
import type { Doctor } from "@/lib/types";
import { getDoctor } from "@/lib/data";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getDoctor(user.uid).then(setDoctor);
    }
  }, [user]);

  return (
    <div className="flex flex-col h-full">
      <AppHeader doctor={doctor} title="Patients" />
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  );
}
