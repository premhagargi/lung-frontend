'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import { addPatient, getDoctor } from '@/lib/data';
import { useAuth } from '@/lib/auth-context';
import type { PatientGender } from '@/lib/types';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(1, 'Age must be at least 1').max(120, 'Age must be less than 120'),
  gender: z.enum(['Male', 'Female', 'Other'] as const),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  medical_history: z.string().min(10, 'Medical history must be at least 10 characters'),
});

type PatientForm = z.infer<typeof patientSchema>;

export default function NewPatientPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = async (data: PatientForm) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get doctor data
      const doctorData = await getDoctor(user.uid);

      // Generate registration ID
      const registrationId = `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Create patient data
      const patientData = {
        name: data.name,
        registration_id: registrationId,
        age: data.age,
        gender: data.gender as PatientGender,
        phone: data.phone,
        medical_history: data.medical_history,
        doctor_id: doctorData.id,
        avatar: '', // Will be set later or use default
      };

      await addPatient(patientData);
      router.push('/patients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register patient');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Register New Patient</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>
            Enter the patient's details to register them in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  {...register('age', { valueAsNumber: true })}
                />
                {errors.age && (
                  <p className="text-sm text-red-600">{errors.age.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => setValue('gender', value as PatientGender)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_history">Medical History</Label>
              <Textarea
                id="medical_history"
                placeholder="Enter patient's medical history, previous conditions, allergies, etc."
                rows={4}
                {...register('medical_history')}
              />
              {errors.medical_history && (
                <p className="text-sm text-red-600">{errors.medical_history.message}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Registering...' : 'Register Patient'}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/patients">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
