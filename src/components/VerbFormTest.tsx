'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Word } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { SquareFunction } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';

interface VerbFormTestProps {
  word: Word;
  onComplete: (isCorrect: boolean, answer: string) => void;
}

const formSchema = z.object({
    v2: z.string().min(1, "Past form is required."),
    v3: z.string().min(1, "Past Participle form is required."),
});

type VerbFormValues = z.infer<typeof formSchema>;

export default function VerbFormTest({ word, onComplete }: VerbFormTestProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<VerbFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { v2: '', v3: '' },
  });

  useEffect(() => {
    form.reset({ v2: '', v3: '' });
    setIsSubmitted(false);
  }, [word, form]);
  
  if (!word.verb_forms) {
    return <Card><CardContent><p>This word is not a verb.</p></CardContent></Card>
  }

  const onSubmit = (data: VerbFormValues) => {
    setIsSubmitted(true);
    const correctV2 = word.verb_forms!.past.word.toLowerCase();
    const correctV3 = word.verb_forms!.past_participle.word.toLowerCase();

    const isCorrect = data.v2.trim().toLowerCase() === correctV2 && data.v3.trim().toLowerCase() === correctV3;
    const userAnswer = `V2: ${data.v2}, V3: ${data.v3}`;
    onComplete(isCorrect, userAnswer);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline text-2xl">Verb Form Test</CardTitle>
                <CardDescription>"{word.word}" ক্রিয়ার সঠিক Past (V2) এবং Past Participle (V3) ফর্ম লিখুন।</CardDescription>
            </div>
            <SquareFunction className="w-8 h-8 text-primary" />
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="v2"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Past Form (V2)</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="e.g., went" 
                                    {...field}
                                    className="text-lg h-14"
                                    disabled={isSubmitted} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="v3"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Past Participle (V3)</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="e.g., gone" 
                                    {...field}
                                    className="text-lg h-14"
                                    disabled={isSubmitted} 
                                />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter>
            <Button type="submit" disabled={isSubmitted} className="ml-auto">
                জমা দিন
            </Button>
            </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
