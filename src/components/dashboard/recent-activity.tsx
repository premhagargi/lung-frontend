import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Scan, Activity } from 'lucide-react';
import type { Patient, LungScan } from '@/lib/types';

interface ActivityItem {
  id: string;
  type: 'patient' | 'scan';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

interface RecentActivityProps {
  patients: Patient[];
  scans: LungScan[];
}

export default function RecentActivity({ patients, scans }: RecentActivityProps) {
  // Combine and sort activities by timestamp
  const activities: ActivityItem[] = [
    ...patients.map(patient => ({
      id: `patient-${patient.id}`,
      type: 'patient' as const,
      title: 'New Patient Registered',
      description: `${patient.name} (${patient.registration_id})`,
      timestamp: patient.created_at || new Date().toISOString(),
      icon: <UserPlus className="h-4 w-4" />,
    })),
    ...scans.map(scan => {
      const patient = patients.find(p => p.id === scan.patient_id);
      return {
        id: `scan-${scan.id}`,
        type: 'scan' as const,
        title: 'Scan Completed',
        description: patient ? `${patient.name} - ${scan.ai_analysis.has_cancer ? 'Cancer Detected' : 'No Cancer'}` : 'Unknown Patient',
        timestamp: scan.consultation_date,
        icon: <Scan className="h-4 w-4" />,
      };
    }),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle className="flex items-center gap-2 font-normal">
            <Activity className="h-5 w-5 font-normal" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest patient registrations and scan completions
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity yet.</p>
            <p className="text-sm text-muted-foreground">Register patients and perform scans to see activity here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {activity.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}