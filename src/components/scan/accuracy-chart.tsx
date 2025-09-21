"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

export default function AccuracyChart({ accuracy }: { accuracy: number }) {
  const data = [
    { name: 'Accuracy', value: accuracy },
    { name: 'Remaining', value: 100 - accuracy },
  ];
  
  const color = accuracy > 90 ? 'hsl(142.1 76.2% 42.2%)' : accuracy > 75 ? 'hsl(47.9 95.8% 53.1%)' : 'hsl(0 84.2% 60.2%)';

  return (
    <div className="relative w-40 h-40">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="100%" stopColor={color} stopOpacity={1}/>
            </linearGradient>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={70}
            startAngle={90}
            endAngle={450}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="url(#accuracyGradient)" />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{accuracy}%</span>
        <span className="text-sm text-muted-foreground">Accuracy</span>
      </div>
    </div>
  );
};
