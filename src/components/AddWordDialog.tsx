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
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Word, SynonymAntonym, VerbForms } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const formSchema = z.object({
  word: z.string().min(1, 'Word is required.'),
  meaning: z.string().min(1, 'Meaning is required.'),
  parts_of_speech: z.string().min(1, 'Parts of speech is required.'),
  example_sentences: z.string().optional(),
  syllables: z.string().optional(),
  synonyms: z.string().optional(),
  antonyms: z.string().optional(),
  
  // Verb forms
  is_verb: z.boolean().default(false),
  present: z.string().optional(),
  past: z.string().optional(),
  past_participle: z.string().optional(),
  present_pronunciation: z.string().optional(),
  past_pronunciation: z.string().optional(),
  past_participle_pronunciation: z.string().optional(),
  present_example: z.string().optional(),
  past_example: z.string().optional(),
  past_participle_example: z.string().optional(),
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

const parseSynAnt = (value?: string): SynonymAntonym[] => {
    if (!value?.trim()) return [];
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'object' && item !== null && 'word' in item)) {
            return parsed.map(item => ({
                word: item.word || '',
                meaning: item.meaning || ''
            }));
        }
    } catch (e) {
        // Not a valid JSON array of objects, treat as comma-separated
    }
    
    return value.split(',').map(s => s.trim()).filter(s => s).map(s => ({ word: s, meaning: '' }));
};

export function AddWordDialog({ isOpen, onOpenChange }: AddWordDialogProps) {
  const { addWord, addMultipleWords } = useVocabulary();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("single");

  const singleWordForm = useForm<AddWordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: '',
      meaning: '',
      parts_of_speech: '',
      example_sentences: '',
      syllables: '',
      synonyms: '',
      antonyms: '',
      is_verb: false,
    },
  });

  const bulkImportForm = useForm<BulkImportFormValues>({
    resolver: zodResolver(bulkImportSchema),
    defaultValues: {
      json: '',
    },
  });

  const isVerb = singleWordForm.watch('is_verb');
  const pos = singleWordForm.watch('parts_of_speech');

  const onSingleSubmit = async (values: AddWordFormValues) => {
    setIsLoading(true);
    try {
      let verb_forms: VerbForms | undefined = undefined;
      if (values.is_verb && values.present && values.past && values.past_participle) {
        verb_forms = {
          present: values.present,
          past: values.past,
          past_participle: values.past_participle,
          present_pronunciation: values.present_pronunciation || '',
          past_pronunciation: values.past_pronunciation || '',
          past_participle_pronunciation: values.past_participle_pronunciation || '',
          form_examples: {
            present: values.present_example || '',
            past: values.past_example || '',
            past_participle: values.past_participle_example || '',
          },
        };
      }

      const success = addWord({
        word: values.word,
        meaning: values.meaning,
        parts_of_speech: values.parts_of_speech,
        syllables: values.syllables ? values.syllables.split(',').map(s => s.trim()).filter(Boolean) : values.word.split('-'),
        example_sentences: values.example_sentences ? values.example_sentences.split('\n').filter(s => s.trim() !== '') : [],
        synonyms: parseSynAnt(values.synonyms),
        antonyms: parseSynAnt(values.antonyms),
        verb_forms: verb_forms,
      });

      if (success) {
        toast({
          title: 'শব্দ যোগ করা হয়েছে',
          description: `"${values.word}" আপনার শব্দভান্ডারে যোগ করা হয়েছে।`,
        });
        singleWordForm.reset();
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
        title: 'ত্রুটি',
        description: 'শব্দটি যোগ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onBulkSubmit = async (values: BulkImportFormValues) => {
    setIsLoading(true);
    try {
      const wordsToImport: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed'>[] = JSON.parse(values.json);
      
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
      setIsLoading(false);
    }
  };


  const handleOpenChange = (open: boolean) => {
    if (!open) {
      singleWordForm.reset();
      bulkImportForm.reset();
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
                <Form {...singleWordForm}>
                <form onSubmit={singleWordForm.handleSubmit(onSingleSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pt-4">
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
                    <FormField
                        control={singleWordForm.control}
                        name="syllables"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Syllables (ঐচ্ছিক, কমা দিয়ে আলাদা করুন)</FormLabel>
                            <FormControl>
                                <Input placeholder="ser,en,dip,i,ty" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={singleWordForm.control}
                        name="example_sentences"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>উদাহরণ বাক্য (ঐচ্ছিক, প্রতিটি নতুন লাইনে)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="The cat sat on the mat.&#10;He is a good boy." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={singleWordForm.control}
                        name="synonyms"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Synonyms (ঐচ্ছিক)</FormLabel>
                            <FormControl>
                                <Input placeholder='[{"word":"good","meaning":"ভাল"}] বা chance,fluke' {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={singleWordForm.control}
                        name="antonyms"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Antonyms (ঐচ্ছিক)</FormLabel>
                            <FormControl>
                                <Input placeholder='[{"word":"bad","meaning":"খারাপ"}] বা misfortune' {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={singleWordForm.control}
                        name="is_verb"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>এটি কি একটি Verb?</FormLabel>
                                </div>
                                <FormControl>
                                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="form-checkbox h-5 w-5 text-primary" />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {(isVerb || pos.toLowerCase().includes('verb')) && (
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="verb-forms">
                                <AccordionTrigger>Verb Forms (ঐচ্ছিক)</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                     <FormField control={singleWordForm.control} name="present" render={({ field }) => (
                                        <FormItem><FormLabel>Present</FormLabel><FormControl><Input placeholder="e.g., go" {...field} /></FormControl></FormItem>
                                     )} />
                                     <FormField control={singleWordForm.control} name="past" render={({ field }) => (
                                        <FormItem><FormLabel>Past</FormLabel><FormControl><Input placeholder="e.g., went" {...field} /></FormControl></FormItem>
                                     )} />
                                     <FormField control={singleWordForm.control} name="past_participle" render={({ field }) => (
                                        <FormItem><FormLabel>Past Participle</FormLabel><FormControl><Input placeholder="e.g., gone" {...field} /></FormControl></FormItem>
                                     )} />
                                     <FormField control={singleWordForm.control} name="present_example" render={({ field }) => (
                                        <FormItem><FormLabel>Present Form Example</FormLabel><FormControl><Input placeholder="I go to school." {...field} /></FormControl></FormItem>
                                     )} />
                                     <FormField control={singleWordForm.control} name="past_example" render={({ field }) => (
                                        <FormItem><FormLabel>Past Form Example</FormLabel><FormControl><Input placeholder="I went to school." {...field} /></FormControl></FormItem>
                                     )} />
                                      <FormField control={singleWordForm.control} name="past_participle_example" render={({ field }) => (
                                        <FormItem><FormLabel>Past Participle Example</FormLabel><FormControl><Input placeholder="I have gone to school." {...field} /></FormControl></FormItem>
                                     )} />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}


                    <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'যোগ করা হচ্ছে...' : 'শব্দ যোগ করুন'}
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
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'ইম্পোর্ট করা হচ্ছে...' : 'শব্দগুলো যোগ করুন'}
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
