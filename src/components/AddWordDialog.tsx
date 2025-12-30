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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Word } from '@/types';

const formSchema = z.object({
  word: z.string().min(1, 'Word is required.'),
  meaning: z.string().optional(),
  parts_of_speech: z.string().optional(),
});

type AddWordFormValues = z.infer<typeof formSchema>;

const bulkImportSchema = z.object({
  json: z.string().min(1, 'JSON data is required.'),
});

type BulkImportFormValues = z.infer<typeof bulkImportSchema>;

interface AddWordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWordDialog({ isOpen, onOpenChange }: AddWordDialogProps) {
  const { addWord, addMultipleWords } = useVocabulary();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [activeTab, setActiveTab] = useState("single");

  const singleWordForm = useForm<AddWordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: '',
      meaning: '',
      parts_of_speech: '',
    },
  });

  const bulkImportForm = useForm<BulkImportFormValues>({
    resolver: zodResolver(bulkImportSchema),
    defaultValues: {
      json: '',
    },
  });

  const onSingleSubmit = async (values: AddWordFormValues) => {
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
          syllables: values.word.split('-'),
          accent_uk: '',
          accent_us: '',
          example_sentences: [],
          synonyms: [],
          antonyms: [],
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
        singleWordForm.reset();
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
      setIsManualEntry(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const onBulkSubmit = async (values: BulkImportFormValues) => {
    setIsGenerating(true);
    try {
      const wordsToImport: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed'>[] = JSON.parse(values.json);
      
      // Basic validation
      if (!Array.isArray(wordsToImport)) {
        throw new Error("JSON must be an array.");
      }

      const { addedCount, skippedCount } = addMultipleWords(wordsToImport);

      toast({
        title: "ইম্পোর্ট সম্পন্ন",
        description: `${addedCount}টি নতুন শব্দ যোগ করা হয়েছে। ${skippedCount}টি শব্দ আগে থেকেই ছিল।`,
      });

      bulkImportForm.reset();
      onOpenChange(false);

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "JSON ইম্পোর্ট ত্রুটি",
        description: error.message || "অনুগ্রহ করে সঠিক JSON ফরম্যাট চেক করুন।",
      });
    } finally {
      setIsGenerating(false);
    }
  };


  const handleOpenChange = (open: boolean) => {
    if (!open) {
      singleWordForm.reset();
      bulkImportForm.reset();
      setIsManualEntry(false);
      setActiveTab("single");
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>নতুন শব্দ যোগ করুন</DialogTitle>
          <DialogDescription>
            একটি নতুন শব্দ যোগ করুন অথবা JSON ব্যবহার করে একসাথে অনেক শব্দ ইম্পোর্ট করুন।
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">একটি শব্দ যোগ করুন</TabsTrigger>
                <TabsTrigger value="bulk">JSON থেকে ইম্পোর্ট</TabsTrigger>
            </TabsList>
            <TabsContent value="single">
                <div className="flex items-center space-x-2 my-4">
                    <Switch id="manual-entry-switch" checked={isManualEntry} onCheckedChange={setIsManualEntry} />
                    <Label htmlFor="manual-entry-switch">ম্যানুয়াল এন্ট্রি</Label>
                </div>
                
                <Form {...singleWordForm}>
                <form onSubmit={singleWordForm.handleSubmit(onSingleSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <FormField
                    control={singleWordForm.control}
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
                        control={singleWordForm.control}
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
                        control={singleWordForm.control}
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
                    </>
                    )}

                    <DialogFooter>
                    <Button type="submit" disabled={isGenerating}>
                        {isGenerating ? (isManualEntry ? 'যোগ করা হচ্ছে...' : 'জেনারেট করা হচ্ছে...') : 'শব্দ যোগ করুন'}
                    </Button>
                    </DialogFooter>
                </form>
                </Form>
            </TabsContent>
            <TabsContent value="bulk">
                 <Form {...bulkImportForm}>
                    <form onSubmit={bulkImportForm.handleSubmit(onBulkSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pt-4">
                        <FormField
                        control={bulkImportForm.control}
                        name="json"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>JSON ডেটা</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder='[{"word": "example", "meaning": "উদাহরণ", ...}]'
                                    className="min-h-[250px] font-code text-xs"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <DialogFooter>
                            <Button type="submit" disabled={isGenerating}>
                                {isGenerating ? 'ইম্পোর্ট করা হচ্ছে...' : 'শব্দগুলো যোগ করুন'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
