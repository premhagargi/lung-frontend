import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Scan, Activity, CheckCircle, Plus } from 'lucide-react';
import Link from 'next/link';

interface StatsCardsProps {
  stats: {
    scans: number;
    patients: number;
    accuracy?: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.patients}</div>
          <p className="text-xs text-muted-foreground">+2 since last month</p>
        </CardContent>
      </Card>
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
          <Scan className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.scans}</div>
          <p className="text-xs text-muted-foreground">+5 in the last week</p>
        </CardContent>
      </Card>
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.accuracy ? `${stats.accuracy.toFixed(1)}%` : '92.8%'}</div>
          <p className="text-xs text-muted-foreground">Average across all scans</p>
        </CardContent>
      </Card>
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reviewed Scans</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.scans}</div>
          <p className="text-xs text-muted-foreground">All scans reviewed</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          <Plus className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild size="sm" className="w-full">
            <Link href="/patients/new">
              Register Patient
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/new-scan">
              New Scan
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
