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
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

const formSchema = z.object({
  word: z.string().min(1, 'Word is required.'),
  meaning: z.string().optional(),
  parts_of_speech: z.string().optional(),
  syllables: z.string().optional(),
  accent_uk: z.string().optional(),
  accent_us: z.string().optional(),
  example_sentences: z.string().optional(),
  synonyms: z.string().optional(),
  antonyms: z.string().optional(),
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
  const [isManualEntry, setIsManualEntry] = useState(false);

  const form = useForm<AddWordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: '',
      meaning: '',
      parts_of_speech: '',
      syllables: '',
      accent_uk: '',
      accent_us: '',
      example_sentences: '',
      synonyms: '',
      antonyms: '',
    },
  });

  const onSubmit = async (values: AddWordFormValues) => {
    setIsGenerating(true);
    try {
      let details;
      if (!isManualEntry) {
        details = await generateWordDetails({ word: values.word });
      } else {
        if (!values.meaning || !values.parts_of_speech) {
            toast({
                variant: 'destructive',
                title: 'প্রয়োজনীয় তথ্য দিন',
                description: 'অনুগ্রহ করে অর্থ এবং পার্টস অফ স্পিচ পূরণ করুন।',
            });
            setIsGenerating(false);
            return;
        }
        details = {
          meaning: values.meaning,
          parts_of_speech: values.parts_of_speech,
          syllables: values.syllables?.split(',').map(s => s.trim()) || [],
          accent_uk: values.accent_uk || '',
          accent_us: values.accent_us || '',
          example_sentences: values.example_sentences?.split('\n').filter(s => s.trim() !== '') || [],
          synonyms: values.synonyms?.split(',').map(s => s.trim()) || [],
          antonyms: values.antonyms?.split(',').map(s => s.trim()) || [],
          verb_forms: undefined,
        }
      }
      
      const success = addWord({
        word: values.word,
        meaning: details.meaning,
        syllables: details.syllables,
        accent_uk: details.accent_uk,
        accent_us: details.accent_us,
        example_sentences: details.example_sentences,
        parts_of_speech: details.parts_of_speech,
        synonyms: details.synonyms || [],
        antonyms: details.antonyms || [],
        verb_forms: details.verb_forms,
      });

      if (success) {
        toast({
          title: 'শব্দ যোগ করা হয়েছে',
          description: `"${values.word}" আপনার শব্দভান্ডারে যোগ করা হয়েছে।`,
        });
        form.reset();
        onOpenChange(false);
        setIsManualEntry(false);
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
        description: 'শব্দের বিবরণ তৈরি করা যায়নি। অনুগ্রহ করে ম্যানুয়ালি চেষ্টা করুন অথবা পরে আবার চেষ্টা করুন।',
      });
      setIsManualEntry(true); // Switch to manual entry on AI error
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setIsManualEntry(false);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>নতুন শব্দ যোগ করুন</DialogTitle>
          <DialogDescription>
            {isManualEntry 
              ? "শব্দের বিবরণ ম্যানুয়ালি পূরণ করুন।"
              : "একটি নতুন ইংরেজি শব্দ লিখুন। AI স্বয়ংক্রিয়ভাবে এর বিবরণ তৈরি করবে।"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 my-4">
          <Switch id="manual-entry-switch" checked={isManualEntry} onCheckedChange={setIsManualEntry} />
          <Label htmlFor="manual-entry-switch">ম্যানুয়াল এন্ট্রি</Label>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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
            {isManualEntry && (
              <>
                <FormField
                  control={form.control}
                  name="meaning"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>অর্থ (বাংলা)</FormLabel>
                      <FormControl>
                        <Input placeholder="বাংলায় অর্থ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parts_of_speech"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parts of Speech</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Noun, Verb" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="syllables"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>সিলেবল (কমা দিয়ে আলাদা করুন)</FormLabel>
                      <FormControl>
                        <Input placeholder="ser,en,dip,i,ty" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accent_us"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>US উচ্চারণ (IPA)</FormLabel>
                      <FormControl>
                        <Input placeholder="/ˌser.ənˈdɪp.ə.t̬i/" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accent_uk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UK উচ্চারণ (IPA)</FormLabel>
                      <FormControl>
                        <Input placeholder="/ˌser.ənˈdɪp.ə.ti/" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="example_sentences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>উদাহরণ বাক্য (প্রতিটি নতুন লাইনে)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="উদাহরণ বাক্য এখানে লিখুন..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="synonyms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Synonyms (কমা দিয়ে আলাদা করুন)</FormLabel>
                      <FormControl>
                        <Input placeholder="chance, fluke" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="antonyms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antonyms (কমা দিয়ে আলাদা করুন)</FormLabel>
                      <FormControl>
                        <Input placeholder="misfortune, bad luck" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (isManualEntry ? 'যোগ করা হচ্ছে...' : 'জেনারেট করা হচ্ছে...') : 'শব্দ যোগ করুন'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
