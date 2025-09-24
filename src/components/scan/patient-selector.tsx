'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getPatients, addPatient, getDoctor } from '@/lib/data';
import type { Patient, PatientGender } from '@/lib/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';

interface PatientSelectorProps {
  onPatientSelect: (patient: Patient) => void;
}

const newPatientSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  age: z.coerce.number().min(1, 'Age must be positive'),
  gender: z.enum(['Male', 'Female', 'Other']),
  medical_history: z.string().min(10, 'Please provide some medical history'),
});

type NewPatientForm = z.infer<typeof newPatientSchema>;

export default function PatientSelector({ onPatientSelect }: PatientSelectorProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<NewPatientForm>({
    resolver: zodResolver(newPatientSchema),
    defaultValues: { name: '', age: undefined, gender: 'Male', medical_history: '' },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const doctorData = await getDoctor(user.uid);
        setDoctorId(doctorData.id);
        const patientsData = await getPatients(doctorData.id);
        setPatients(patientsData);
      } catch (error) {
        console.error('Failed to load patients:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load patients.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleSelectExisting = () => {
    if (!selectedPatientId) {
        toast({ variant: 'destructive', title: 'Please select a patient' });
        return;
    };
    const patient = patients.find(p => p.id === selectedPatientId);
    if (patient) onPatientSelect(patient);
  };

  const handleCreateNew = async (values: NewPatientForm) => {
    if (!doctorId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Doctor information not available.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const newPatient = await addPatient({
        ...values,
        doctor_id: doctorId,
        registration_id: `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        phone: '', // Will be filled in patient registration
        avatar: '', // will be assigned in data.ts
      });
      toast({ title: 'Patient Created', description: `${newPatient.name} has been added.` });
      // Refresh patients list
      const patientsData = await getPatients(doctorId);
      setPatients(patientsData);
      onPatientSelect(newPatient);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to create patient.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Tabs defaultValue="existing">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="existing">Existing Patient</TabsTrigger>
        <TabsTrigger value="new">New Patient</TabsTrigger>
      </TabsList>
      <TabsContent value="existing" className="space-y-4 pt-4">
        <h3 className="text-sm font-medium">Select a patient from your list</h3>
        {loading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select onValueChange={setSelectedPatientId}>
            <SelectTrigger>
              <SelectValue placeholder="Select patient..." />
            </SelectTrigger>
            <SelectContent>
              {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.registration_id})</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Button onClick={handleSelectExisting} className="w-full">Continue</Button>
      </TabsContent>
      <TabsContent value="new" className="pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateNew)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
             </div>
             <FormField control={form.control} name="medical_history" render={({ field }) => (
                <FormItem><FormLabel>Medical History</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Creating...' : 'Create Patient & Continue'}
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
