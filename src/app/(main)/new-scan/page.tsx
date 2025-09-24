'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Patient, LungScan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

import { performScanAnalysis } from './actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import PatientSelector from '@/components/scan/patient-selector';
import ImageUpload from '@/components/scan/image-upload';
import AnalysisResults from '@/components/scan/analysis-results';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzeLungScanImage } from '@/ai/flows/analyze-lung-scan-image';
import ModelPredictionsChart from '@/components/scan/model-predictions-chart';
import { generateScanReportPDF } from '@/lib/pdf-report';

type AnalysisResult = Awaited<ReturnType<typeof analyzeLungScanImage>>;

const availableModels = [
  { key: 'cnn', label: 'Convolutional Neural Network (CNN)' },
  { key: 'nb', label: 'Naive Bayes (NB)' },
  { key: 'resnet', label: 'ResNet' },
];

export default function NewScanPage() {
  const [step, setStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(['cnn', 'nb', 'resnet']);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setStep(2);
  };

  const handleImageUpload = (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setStep(2.5);
  };

  const handleModelSelection = async () => {
    if (!imageDataUrl) return;
    setIsLoading(true);
    setStep(3);

    try {
      const result = await analyzeLungScanImage({ scanImageUri: imageDataUrl, selectedModels });
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'The AI model could not process the image. Please try again.',
      });
      setStep(2.5); // Go back to model selection step
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
      doctorNotes: 'Awaiting review.',
    });

    setIsLoading(false);
    if (actionResult.success) {
      toast({
        title: 'Scan Saved',
        description: "The analysis has been saved to the patient's history.",
      });
      router.push(`/`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: actionResult.error,
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!analysisResult || !selectedPatient) return;

    const scanDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const scanTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    generateScanReportPDF({
      patient: selectedPatient,
      scanResult: {
        predictions: analysisResult.predictions,
        hasCancer: analysisResult.hasCancer,
        accuracyPercentage: analysisResult.accuracyPercentage,
        confidenceLevel: analysisResult.confidenceLevel,
        precautions: analysisResult.precautions,
        overcomeSolutions: analysisResult.overcomeSolutions,
      },
      scanDate,
      scanTime,
      analyzedBy: selectedPatient.name,
      reportId: `RPT${Date.now()}`,
    });

    toast({
      title: 'PDF Downloaded',
      description: 'The scan report has been downloaded successfully.',
    });
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedPatient(null);
    setImageDataUrl(null);
    setSelectedModels(['cnn', 'nb', 'resnet']);
    setAnalysisResult(null);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="w-full max-w-full mx-auto bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Step 1: Select Patient</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Choose the patient you want to perform the lung scan analysis for. You can add a new patient if none exists.
              </p>
            </CardHeader>
            <CardContent>
              <PatientSelector onPatientSelect={handlePatientSelect} />
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card className="w-full max-w-full mx-auto bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Step 2: Upload Scan for {selectedPatient?.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a high-quality lung scan image (JPEG, PNG) for analysis. Ensure the scan is clear and well-lit.
              </p>
            </CardHeader>
            <CardContent>
              <ImageUpload onImageUpload={handleImageUpload} />
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />Back
              </Button>
            </CardFooter>
          </Card>
        );
      case 2.5:
        return (
          <Card className="w-full max-w-full mx-auto bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Step 2.5: Select Models for {selectedPatient?.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select which AI models to run for the analysis. Multiple models improve prediction accuracy.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableModels.map((model) => (
                  <div key={model.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={model.key}
                      checked={selectedModels.includes(model.key)}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedModels([...selectedModels, model.key]);
                        else setSelectedModels(selectedModels.filter((m) => m !== model.key));
                      }}
                    />
                    <label
                      htmlFor={model.key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {model.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />Back
              </Button>
              <Button onClick={handleModelSelection} disabled={selectedModels.length === 0}>
                Analyze with {selectedModels.length} Model{selectedModels.length !== 1 ? 's' : ''}{' '}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card className="w-full max-w-full mx-auto bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Step 3: Analysis Results</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Review the AI analysis results below. You can download a detailed PDF report or save it to the patient's history.
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 h-96">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analyzing scan... This may take a moment.</p>
                </div>
              ) : (
                analysisResult && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <ImageUpload onImageUpload={handleImageUpload} initialImage={imageDataUrl} />
                      <ModelPredictionsChart predictions={analysisResult.predictions} />
                    </div>
                    <AnalysisResults
                      analysis={{
                        has_cancer: analysisResult.hasCancer,
                        accuracy_percentage: analysisResult.accuracyPercentage,
                        confidence_level: analysisResult.confidenceLevel as 'Low' | 'Medium' | 'High',
                        precautions: analysisResult.precautions,
                        overcome_solutions: analysisResult.overcomeSolutions,
                        predictions: analysisResult.predictions,
                      }}
                    />
                  </div>
                )
              )}
            </CardContent>
            <CardFooter className="flex justify-between flex-wrap gap-2">
              <Button variant="outline" onClick={resetFlow}>
                Start Over
              </Button>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={!analysisResult}
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  📄 Download PDF Report
                </Button>
                <Button
                  onClick={handleSaveAndFinish}
                  disabled={isLoading || !analysisResult}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      Save and Finish <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
      default:
        return null;
    }
  };

  return <div className="py-8 px-4">{renderStep()}</div>;
}
