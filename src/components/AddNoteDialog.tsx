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
import { useNotes } from '@/hooks/use-notes';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Note } from '@/types';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(1, 'Content is required.'),
});

type AddNoteFormValues = z.infer<typeof formSchema>;

const bulkImportSchema = z.object({
  json: z.string().min(1, 'JSON data is required.'),
});

type BulkImportFormValues = z.infer<typeof bulkImportSchema>;

interface AddNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  noteToEdit?: Note | null;
}

export function AddNoteDialog({ isOpen, onOpenChange, noteToEdit }: AddNoteDialogProps) {
  const { addNote, addMultipleNotes, updateNote } = useNotes();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("single");

  const isEditMode = !!noteToEdit;

  const singleNoteForm = useForm<AddNoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  useEffect(() => {
    if (isEditMode && noteToEdit) {
      singleNoteForm.reset({
        title: noteToEdit.title,
        content: noteToEdit.content,
      });
    } else {
      singleNoteForm.reset({ title: '', content: '' });
    }
  }, [isOpen, isEditMode, noteToEdit, singleNoteForm]);

  const bulkImportForm = useForm<BulkImportFormValues>({
    resolver: zodResolver(bulkImportSchema),
    defaultValues: { json: '' },
  });

  const onSingleSubmit = async (values: AddNoteFormValues) => {
    setIsLoading(true);
    try {
      if (isEditMode && noteToEdit) {
        updateNote(noteToEdit.id, values);
        toast({ title: 'নোট আপডেট হয়েছে', description: `"${values.title}" নোটটি আপডেট করা হয়েছে।` });
      } else {
        const success = addNote(values);
        if (success) {
          toast({ title: 'নোট যোগ করা হয়েছে', description: `"${values.title}" আপনার তালিকায় যোগ করা হয়েছে।` });
        } else {
          toast({ variant: 'destructive', title: 'ত্রুটি', description: `এই শিরোনামের একটি নোট ইতিমধ্যে বিদ্যমান।` });
        }
      }

      singleNoteForm.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'ত্রুটি', description: isEditMode ? 'নোটটি আপডেট করা যায়নি।' : 'নোটটি যোগ করা যায়নি।' });
    } finally { setIsLoading(false); }
  };

  const onBulkSubmit = async (values: BulkImportFormValues) => {
    setIsLoading(true);
    try {
      let jsonString = values.json.trim().replace(/,\s*([\]}])/g, '$1');
      let parsedJson = JSON.parse(jsonString);

      if (!Array.isArray(parsedJson)) parsedJson = [parsedJson];
      if (!Array.isArray(parsedJson)) throw new Error("JSON must be an array.");
      
      const notesToImport = parsedJson.map((item: any) => {
        // Handle simple format
        if (typeof item === 'object' && item !== null && item.title && item.content && !item.topic_name) {
          return { title: item.title, content: item.content };
        }
        
        // Handle complex grammar format with rich text formatting
        if (typeof item === 'object' && item !== null && item.topic_name) {
          const { topic_name, category, summary, short_trick, details } = item;
          let content = `Category: ${category}\n\n`;
          content += `📝 *Summary:*\n${summary}\n\n`;
          content += `✨ *Short Trick:*\n${short_trick}\n\n`;
          
          if(details && Array.isArray(details)) {
              content += '--------------------\n\n';
              content += '📖 *Details:*\n\n';
              details.forEach((detail: any) => {
                  content += `  *${detail.title}*\n`;
                  content += `  ${detail.description}\n`;
                  if(detail.formula) content += `  *Formula:* ${detail.formula}\n`;
                  
                  if(detail.examples && Array.isArray(detail.examples)) {
                      content += '\n  *Examples:*\n';
                      detail.examples.forEach((ex: any) => {
                          content += `    • ${ex.s}\n`;
                          content += `      *Explanation:* ${ex.n}\n`;
                      });
                  }
                  content += '\n';
              });
          }
          return { title: topic_name, content: content.trim() };
        }
        return null;
      }).filter(Boolean);

      const { addedCount, skippedCount } = addMultipleNotes(notesToImport as {title: string; content: string}[]);
      toast({ title: "ইম্পোর্ট সম্পন্ন", description: `${addedCount}টি নতুন নোট যোগ করা হয়েছে। ${skippedCount}টি নোট আগে থেকেই ছিল।` });

      bulkImportForm.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "JSON ইম্পোর্ট ত্রুটি", description: error.message || "অনুগ্রহ করে সঠিক JSON ফরম্যাট চেক করুন।" });
    } finally { setIsLoading(false); }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      singleNoteForm.reset();
      bulkImportForm.reset();
      if (!isEditMode) setActiveTab("single");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'নোট সম্পাদনা করুন' : 'নতুন নোট যোগ করুন'}</DialogTitle>
          {!isEditMode && <DialogDescription>একটি নতুন নোট যোগ করুন অথবা JSON ব্যবহার করে একসাথে অনেক নোট ইম্পোর্ট করুন।</DialogDescription>}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {!isEditMode && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">একটি নোট যোগ করুন</TabsTrigger>
              <TabsTrigger value="bulk">JSON থেকে ইম্পোর্ট</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="single" {...(isEditMode ? { forceMount: true } : {})}>
            <Form {...singleNoteForm}>
              <form onSubmit={singleNoteForm.handleSubmit(onSingleSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pt-4">
                <FormField control={singleNoteForm.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={singleNoteForm.control} name="content" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl><Textarea className="min-h-[150px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (isEditMode ? 'আপডেট করা হচ্ছে...' : 'যোগ করা হচ্ছে...') : (isEditMode ? 'নোট আপডেট করুন' : 'নোট যোগ করুন')}
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
                        <Textarea placeholder='[{"title": "My Note", "content": "Details here..."}, ...]' className="min-h-[250px] font-code text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>{isLoading ? 'ইম্পোর্ট করা হচ্ছে...' : 'নোটগুলো যোগ করুন'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
