'use client';

import { AppHeader } from "@/components/layout/app-header";
import type { Doctor } from "@/lib/types";
import { getDoctor } from "@/lib/data";
import { useEffect, useState } from "react";

export default function NewScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    getDoctor('1').then(setDoctor);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <AppHeader doctor={doctor} title="New Scan Analysis" />
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  );
}
