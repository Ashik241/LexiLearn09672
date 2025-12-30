'use client';

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

const formSchema = z.object({
  word: z.string().min(1, 'Word is required.'),
  meaning: z.string().min(1, 'Meaning is required.'),
  syllables: z.string().optional(),
  accent_uk: z.string().optional(),
  accent_us: z.string().optional(),
});

type AddWordFormValues = z.infer<typeof formSchema>;

interface AddWordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWordDialog({ isOpen, onOpenChange }: AddWordDialogProps) {
  const { addWord } = useVocabulary();
  const { toast } = useToast();

  const form = useForm<AddWordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: '',
      meaning: '',
      syllables: '',
      accent_uk: '',
      accent_us: '',
    },
  });

  const onSubmit = (values: AddWordFormValues) => {
    const success = addWord({
        ...values,
        syllables: values.syllables ? values.syllables.split(/[-,\s]+/) : [],
    });

    if (success) {
      toast({
        title: 'Word Added',
        description: `"${values.word}" has been added to your vocabulary.`,
      });
      form.reset();
      onOpenChange(false);
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `The word "${values.word}" already exists.`,
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Word</DialogTitle>
          <DialogDescription>
            Manually add a new word to your learning list.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Word</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., serendipity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meaning"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meaning</FormLabel>
                  <FormControl>
                    <Input placeholder="The occurrence of happy accidents" {...field} />
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
                  <FormLabel>Syllables (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ser-en-dip-i-ty" {...field} />
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
                  <FormLabel>UK Accent (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="/ˌser.ənˈdɪp.ə.ti/" {...field} />
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
                  <FormLabel>US Accent (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="/ˌser.ənˈdɪp.ə.t̬i/" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Adding...' : 'Add Word'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
