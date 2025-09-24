'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { ModelPrediction } from '@/lib/types';

interface ModelPredictionsChartProps {
  predictions: ModelPrediction[];
}

export default function ModelPredictionsChart({ predictions }: ModelPredictionsChartProps) {
  const [visibleModels, setVisibleModels] = useState<string[]>(predictions.map(p => p.model.toUpperCase()));

  const chartData = predictions
    .filter(p => visibleModels.includes(p.model.toUpperCase()))
    .map(p => ({
      model: p.model.toUpperCase(),
      confidence: parseFloat(p.confidence.replace('%', '')),
      prediction: p.prediction,
    }));

  const toggleModelVisibility = (model: string) => {
    setVisibleModels(prev =>
      prev.includes(model)
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-lg shadow-lg">
          <p className="font-bold">{`${label}`}</p>
          <p className="text-sm text-muted-foreground">{`Prediction: ${payload[0].payload.prediction}`}</p>
          <p className="text-sm text-primary">{`Confidence: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Predictions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Toggle model visibility:</p>
          <div className="flex flex-wrap gap-4">
            {predictions.map((prediction) => (
              <div key={prediction.model} className="flex items-center space-x-2">
                <Checkbox
                  id={`chart-${prediction.model}`}
                  checked={visibleModels.includes(prediction.model.toUpperCase())}
                  onCheckedChange={() => toggleModelVisibility(prediction.model.toUpperCase())}
                />
                <label htmlFor={`chart-${prediction.model}`} className="text-sm font-medium">
                  {prediction.model.toUpperCase()}
                </label>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="model" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis unit="%" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsla(var(--muted), 0.5)'}} />
            <Bar dataKey="confidence" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
