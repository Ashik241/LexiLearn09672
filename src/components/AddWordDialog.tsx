'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useVocabulary } from '@/hooks/use-vocabulary';
import { useToast } from '@/hooks/use-toast';
import { generateWordDetails } from '@/ai/flows/generate-word-details';

const formSchema = z.object({
  word: z.string().min(1, 'Word is required.'),
});

type AddWordFormValues = z.infer<typeof formSchema>;

interface AddWordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWordDialog({ isOpen, onOpenChange }: AddWordDialogProps) {
  const { addWord } = useVocabulary();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<AddWordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: '',
    },
  });

  const onSubmit = async (values: AddWordFormValues) => {
    setIsGenerating(true);
    try {
      const details = await generateWordDetails({ word: values.word });
      
      const success = addWord({
        word: values.word,
        meaning: details.meaning,
        syllables: details.syllables,
        accent_uk: details.accent_uk,
        accent_us: details.accent_us,
      });

      if (success) {
        toast({
          title: 'শব্দ যোগ করা হয়েছে',
          description: `"${values.word}" আপনার শব্দভান্ডারে যোগ করা হয়েছে।`,
        });
        form.reset();
        onOpenChange(false);
      } else {
        toast({
            variant: 'destructive',
            title: 'ত্রুটি',
            description: `"${values.word}" শব্দটি ইতিমধ্যে বিদ্যমান।`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI ত্রুটি',
        description: 'শব্দের বিবরণ তৈরি করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>নতুন শব্দ যোগ করুন</DialogTitle>
          <DialogDescription>
            একটি নতুন শব্দ লিখুন। AI স্বয়ংক্রিয়ভাবে এর অর্থ এবং সিলেবল খুঁজে বের করবে।
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>শব্দ</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., serendipity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? 'জেনারেট করা হচ্ছে...' : 'শব্দ যোগ করুন'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
