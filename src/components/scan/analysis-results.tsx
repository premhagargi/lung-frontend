import type { LungScan } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import AccuracyChart from './accuracy-chart';
import { AlertTriangle, CheckCircle2, Shield, Stethoscope } from 'lucide-react';
import ModelPredictionsChart from './model-predictions-chart';

interface AnalysisResultsProps {
  analysis: LungScan['ai_analysis'];
}

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const { has_cancer, accuracy_percentage, confidence_level, precautions, overcome_solutions, predictions } = analysis;

  const getConfidenceBadge = (level: string) => {
    const baseClasses = "capitalize";
    switch (level.toLowerCase()) {
      case 'high':
        return <Badge variant="secondary" className={`${baseClasses} bg-green-100 text-green-800`}>High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Medium</Badge>;
      case 'low':
        return <Badge variant="secondary" className={`${baseClasses} bg-orange-100 text-orange-800`}>Low</Badge>;
      default:
        return <Badge variant="secondary" className={baseClasses}>{level}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-background p-6">
        <h3 className="text-lg font-semibold">AI Diagnosis Summary</h3>
        {has_cancer ? (
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <span className="text-xl font-bold">Potential Cancer Detected</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            <span className="text-xl font-bold">No Cancer Detected</span>
          </div>
        )}
        <div className="flex items-center gap-4">
            <AccuracyChart accuracy={accuracy_percentage} />
            <div className="text-center">
                <div className="text-3xl font-bold">{getConfidenceBadge(confidence_level)}</div>
                <div className="text-sm text-muted-foreground">Overall Confidence</div>
            </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="flex items-center gap-2 font-semibold mb-2">
            <Shield className="h-5 w-5 text-primary" />
            Suggested Precautions
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {precautions.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="flex items-center gap-2 font-semibold mb-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Potential Treatment Options
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {overcome_solutions.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
      </div>
      
      <div className="rounded-md border border-orange-300 bg-orange-50 p-4 text-orange-900">
        <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <h5 className="font-semibold">Disclaimer</h5>
                <p className="text-sm">This AI analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
