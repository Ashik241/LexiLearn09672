'use client';

import { useState, useEffect } from 'react';
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
  meaning_explanation: z.string().optional(),
  parts_of_speech: z.string().min(1, 'Parts of speech is required.'),
  usage_distinction: z.string().optional(),
  example_sentences: z.string().optional(),
  syllables: z.string().optional(),
  synonyms: z.string().optional(),
  antonyms: z.string().optional(),
  
  is_verb: z.boolean().default(false),
  
  v1_word: z.string().optional(),
  v1_pronunciation: z.string().optional(),
  v1_bangla_meaning: z.string().optional(),
  v1_usage_timing: z.string().optional(),
  v1_example: z.string().optional(),

  v2_word: z.string().optional(),
  v2_pronunciation: z.string().optional(),
  v2_bangla_meaning: z.string().optional(),
  v2_usage_timing: z.string().optional(),
  v2_example: z.string().optional(),

  v3_word: z.string().optional(),
  v3_pronunciation: z.string().optional(),
  v3_bangla_meaning: z.string().optional(),
  v3_usage_timing: z.string().optional(),
  v3_example: z.string().optional(),
});

type AddWordFormValues = z.infer<typeof formSchema>;

const bulkImportSchema = z.object({
  json: z.string().min(1, 'JSON data is required.'),
});

type BulkImportFormValues = z.infer<typeof bulkImportSchema>;

interface AddWordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  wordToEdit?: Word | null;
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
    } catch {}
    return value.split(',').map(s => s.trim()).filter(s => s).map(s => ({ word: s, meaning: '' }));
};

const stringifySynAnt = (items?: SynonymAntonym[]): string => {
    if (!items || items.length === 0) return '';
    if (items.some(item => item.meaning)) return JSON.stringify(items);
    return items.map(item => item.word).join(', ');
};

const parseSynAntStringArray = (arr: any): SynonymAntonym[] => {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.map(item => {
        if (typeof item === 'string') {
            const match = item.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) return { word: match[1].trim(), meaning: match[2].trim() };
            return { word: item, meaning: '' };
        }
        if (typeof item === 'object' && item !== null && 'word' in item) {
            return { word: item.word, meaning: item.meaning || '' };
        }
        return null;
    }).filter((item): item is SynonymAntonym => item !== null);
};

export function AddWordDialog({ isOpen, onOpenChange, wordToEdit }: AddWordDialogProps) {
  const { addWord, addMultipleWords, updateWord } = useVocabulary();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("single");

  const isEditMode = !!wordToEdit;

  const singleWordForm = useForm<AddWordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: '',
      meaning: '',
      meaning_explanation: '',
      parts_of_speech: '',
      example_sentences: '',
      syllables: '',
      synonyms: '',
      antonyms: '',
      is_verb: false,
    },
  });

  useEffect(() => {
    if (isEditMode && wordToEdit) {
      singleWordForm.reset({
        word: wordToEdit.word,
        meaning: wordToEdit.meaning,
        meaning_explanation: wordToEdit.meaning_explanation,
        parts_of_speech: wordToEdit.parts_of_speech,
        usage_distinction: wordToEdit.usage_distinction,
        syllables: wordToEdit.syllables?.join(', '),
        example_sentences: wordToEdit.example_sentences?.join('\n'),
        synonyms: stringifySynAnt(wordToEdit.synonyms),
        antonyms: stringifySynAnt(wordToEdit.antonyms),
        is_verb: !!wordToEdit.verb_forms || wordToEdit.parts_of_speech.toLowerCase().includes('verb'),
        
        v1_word: wordToEdit.verb_forms?.v1_present.word,
        v1_pronunciation: wordToEdit.verb_forms?.v1_present.pronunciation,
        v1_bangla_meaning: wordToEdit.verb_forms?.v1_present.bangla_meaning,
        v1_usage_timing: wordToEdit.verb_forms?.v1_present.usage_timing,
        v1_example: wordToEdit.verb_forms?.form_examples.v1,

        v2_word: wordToEdit.verb_forms?.v2_past.word,
        v2_pronunciation: wordToEdit.verb_forms?.v2_past.pronunciation,
        v2_bangla_meaning: wordToEdit.verb_forms?.v2_past.bangla_meaning,
        v2_usage_timing: wordToEdit.verb_forms?.v2_past.usage_timing,
        v2_example: wordToEdit.verb_forms?.form_examples.v2,
        
        v3_word: wordToEdit.verb_forms?.v3_past_participle.word,
        v3_pronunciation: wordToEdit.verb_forms?.v3_past_participle.pronunciation,
        v3_bangla_meaning: wordToEdit.verb_forms?.v3_past_participle.bangla_meaning,
        v3_usage_timing: wordToEdit.verb_forms?.v3_past_participle.usage_timing,
        v3_example: wordToEdit.verb_forms?.form_examples.v3,
      });
    } else {
        singleWordForm.reset();
    }
  }, [isOpen, isEditMode, wordToEdit, singleWordForm]);

  const bulkImportForm = useForm<BulkImportFormValues>({
    resolver: zodResolver(bulkImportSchema),
    defaultValues: { json: '' },
  });

  const isVerb = singleWordForm.watch('is_verb');
  const pos = singleWordForm.watch('parts_of_speech');

  const onSingleSubmit = async (values: AddWordFormValues) => {
    setIsLoading(true);
    try {
      let verb_forms: VerbForms | undefined = undefined;
      const isVerbDetected = values.is_verb || values.parts_of_speech.toLowerCase().includes('verb');
      
      if (isVerbDetected && values.v1_word && values.v2_word && values.v3_word) {
        verb_forms = {
          v1_present: {
            word: values.v1_word,
            pronunciation: values.v1_pronunciation || '',
            bangla_meaning: values.v1_bangla_meaning || '',
            usage_timing: values.v1_usage_timing || '',
          },
          v2_past: {
            word: values.v2_word,
            pronunciation: values.v2_pronunciation || '',
            bangla_meaning: values.v2_bangla_meaning || '',
            usage_timing: values.v2_usage_timing || '',
          },
          v3_past_participle: {
            word: values.v3_word,
            pronunciation: values.v3_pronunciation || '',
            bangla_meaning: values.v3_bangla_meaning || '',
            usage_timing: values.v3_usage_timing || '',
          },
          form_examples: {
            v1: values.v1_example || '',
            v2: values.v2_example || '',
            v3: values.v3_example || '',
          },
        };
      }

      const wordPayload = {
        word: values.word,
        meaning: values.meaning,
        meaning_explanation: values.meaning_explanation,
        parts_of_speech: values.parts_of_speech,
        usage_distinction: values.usage_distinction,
        syllables: values.syllables ? values.syllables.split(',').map(s => s.trim()).filter(Boolean) : values.word.split('-'),
        example_sentences: values.example_sentences ? values.example_sentences.split('\n').filter(s => s.trim() !== '') : [],
        synonyms: parseSynAnt(values.synonyms),
        antonyms: parseSynAnt(values.antonyms),
        verb_forms,
      };

      if (isEditMode && wordToEdit) {
        updateWord(wordToEdit.id, wordPayload);
        toast({ title: 'শব্দ আপডেট হয়েছে', description: `"${values.word}" শব্দটি আপডেট করা হয়েছে।` });
      } else {
        const success = addWord(wordPayload);
        if (success) {
          toast({ title: 'শব্দ যোগ করা হয়েছে', description: `"${values.word}" আপনার শব্দভান্ডারে যোগ করা হয়েছে।` });
        } else {
          toast({ variant: 'destructive', title: 'ত্রুটি', description: `"${values.word}" শব্দটি ইতিমধ্যে বিদ্যমান।` });
        }
      }

      singleWordForm.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'ত্রুটি', description: isEditMode ? 'শব্দটি আপডেট করা যায়নি।' : 'শব্দটি যোগ করা যায়নি।' });
    } finally { setIsLoading(false); }
  };

  const onBulkSubmit = async (values: BulkImportFormValues) => {
    setIsLoading(true);
    try {
      let jsonString = values.json.trim().replace(/,\s*([\]}])/g, '$1');
      let parsedJson = JSON.parse(jsonString);

      if (!Array.isArray(parsedJson) && parsedJson.word && parsedJson.meaning) parsedJson = [parsedJson];
      if (!Array.isArray(parsedJson)) throw new Error("JSON must be an array.");
      
      const wordsToImport = parsedJson.map((item: any) => {
        if (typeof item === 'object' && item !== null && item.word && typeof item.data === 'object') return { ...item.data, word: item.word };
        return item;
      }).map((word: any) => ({
        ...word,
        synonyms: parseSynAntStringArray(word.synonyms),
        antonyms: parseSynAntStringArray(word.antonyms),
      }));

      const { addedCount, skippedCount } = addMultipleWords(wordsToImport);
      toast({ title: "ইম্পোর্ট সম্পন্ন", description: `${addedCount}টি নতুন শব্দ যোগ করা হয়েছে। ${skippedCount}টি শব্দ আগে থেকেই ছিল।` });

      bulkImportForm.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "JSON ইম্পোর্ট ত্রুটি", description: error.message || "অনুগ্রহ করে সঠিক JSON ফরম্যাট চেক করুন।" });
    } finally { setIsLoading(false); }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      singleWordForm.reset();
      bulkImportForm.reset();
      if (!isEditMode) setActiveTab("single");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'শব্দ সম্পাদনা করুন' : 'নতুন শব্দ যোগ করুন'}</DialogTitle>
          {!isEditMode && <DialogDescription>একটি নতুন শব্দ যোগ করুন অথবা JSON ব্যবহার করে একসাথে অনেক শব্দ ইম্পোর্ট করুন।</DialogDescription>}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {!isEditMode && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">একটি শব্দ যোগ করুন</TabsTrigger>
              <TabsTrigger value="bulk">JSON থেকে ইম্পোর্ট</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="single" {...(isEditMode ? { forceMount: true } : {})}>
            <Form {...singleWordForm}>
              <form onSubmit={singleWordForm.handleSubmit(onSingleSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pt-4">
                {/* All form fields here (as in your original code) */}
                {/* ... */}
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (isEditMode ? 'আপডেট করা হচ্ছে...' : 'যোগ করা হচ্ছে...') : (isEditMode ? 'শব্দ আপডেট করুন' : 'শব্দ যোগ করুন')}
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
                        <Textarea placeholder='[{"word": "example", "meaning": "উদাহরণ", ...}]' className="min-h-[250px] font-code text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>{isLoading ? 'ইম্পোর্ট করা হচ্ছে...' : 'শব্দগুলো যোগ করুন'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
