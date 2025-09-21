import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Scan, Activity, CheckCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    scans: number;
    patients: number;
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
          <div className="text-2xl font-bold">92.8%</div>
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
    </div>
  );
}
