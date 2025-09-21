'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Doctor, DoctorSpecialty } from '@/lib/types';
import { updateDoctorProfile } from '@/lib/data';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  specialty: z.enum(['Pulmonologist', 'Oncologist', 'Radiologist', 'General Practitioner']),
  hospital: z.string().min(2, { message: 'Hospital name is required.' }),
});

type OnboardingFormValues = z.infer<typeof formSchema>;

interface DoctorOnboardingProps {
  doctor: Doctor;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (doctor: Doctor) => void;
}

export default function DoctorOnboarding({ doctor, isOpen, onOpenChange, onProfileUpdate }: DoctorOnboardingProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: doctor.name || '',
      specialty: doctor.specialty || 'General Practitioner',
      hospital: doctor.hospital || '',
    },
  });

  async function onSubmit(values: OnboardingFormValues) {
    setIsSubmitting(true);
    try {
      const updatedDoctor = await updateDoctorProfile(doctor.id, values);
      onProfileUpdate(updatedDoctor);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Welcome to LungVision AI. Please complete your professional profile to continue.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialty</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pulmonologist">Pulmonologist</SelectItem>
                      <SelectItem value="Oncologist">Oncologist</SelectItem>
                      <SelectItem value="Radiologist">Radiologist</SelectItem>
                      <SelectItem value="General Practitioner">General Practitioner</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hospital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospital / Clinic</FormLabel>
                  <FormControl>
                    <Input placeholder="City General Hospital" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save and Continue'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
