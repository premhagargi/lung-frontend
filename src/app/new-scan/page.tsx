'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Patient, LungScan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

import { performScanAnalysis } from './actions';
import { Button } from '@/components/ui/button';
import PatientSelector from '@/components/scan/patient-selector';
import ImageUpload from '@/components/scan/image-upload';
import AnalysisResults from '@/components/scan/analysis-results';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzeLungScanImage } from '@/ai/flows/analyze-lung-scan-image';
import ModelPredictionsChart from '@/components/scan/model-predictions-chart';

type AnalysisResult = Awaited<ReturnType<typeof analyzeLungScanImage>>;

export default function NewScanPage() {
  const [step, setStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setStep(2);
  };

  const handleImageUpload = async (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setIsLoading(true);
    setStep(3);
    
    try {
      const result = await analyzeLungScanImage({ scanImageUri: dataUrl });
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'The AI model could not process the image. Please try again.',
      });
      setStep(2); // Go back to upload step
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveAndFinish = async () => {
    if (!analysisResult || !selectedPatient || !imageDataUrl) return;

    setIsLoading(true);
    const actionResult = await performScanAnalysis({
        scanImageUri: imageDataUrl,
        patient: selectedPatient,
        doctorNotes: 'Awaiting review.'
    });

    setIsLoading(false);
    if (actionResult.success) {
        toast({
            title: "Scan Saved",
            description: "The analysis has been saved to the patient's history.",
        });
        router.push(`/`);
    } else {
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: actionResult.error,
        });
    }
  }

  const resetFlow = () => {
    setStep(1);
    setSelectedPatient(null);
    setImageDataUrl(null);
    setAnalysisResult(null);
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="w-full max-w-2xl mx-auto bg-card/80 backdrop-blur-sm">
            <CardHeader><CardTitle>Step 1: Select Patient</CardTitle></CardHeader>
            <CardContent>
              <PatientSelector onPatientSelect={handlePatientSelect} />
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card className="w-full max-w-2xl mx-auto bg-card/80 backdrop-blur-sm">
            <CardHeader><CardTitle>Step 2: Upload Scan for {selectedPatient?.name}</CardTitle></CardHeader>
            <CardContent>
              <ImageUpload onImageUpload={handleImageUpload} />
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            </CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card className="w-full max-w-4xl mx-auto bg-card/80 backdrop-blur-sm">
            <CardHeader><CardTitle>Step 3: Analysis Results</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 h-96">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analyzing scan... This may take a moment.</p>
                </div>
              ) : analysisResult && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <ImageUpload onImageUpload={handleImageUpload} initialImage={imageDataUrl}/>
                      <ModelPredictionsChart predictions={analysisResult.predictions} />
                    </div>
                    <AnalysisResults analysis={{
                        has_cancer: analysisResult.hasCancer,
                        accuracy_percentage: analysisResult.accuracyPercentage,
                        confidence_level: analysisResult.confidenceLevel as 'Low' | 'Medium' | 'High',
                        precautions: analysisResult.precautions,
                        overcome_solutions: analysisResult.overcomeSolutions,
                        predictions: analysisResult.predictions,
                    }}/>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetFlow}>Start Over</Button>
              <Button onClick={handleSaveAndFinish} disabled={isLoading || !analysisResult} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <>Save and Finish <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </CardFooter>
          </Card>
        );
      default:
        return null;
    }
  };

  return <div className="container mx-auto py-8">{renderStep()}</div>;
}
