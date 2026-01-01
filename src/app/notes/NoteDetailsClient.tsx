'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNotes } from '@/hooks/use-notes';
import type { Note } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingSkeleton() {
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-48" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-5 w-full" />
      </CardContent>
    </Card>
  );
}

export function NoteDetailsClient({ noteId }: { noteId: string }) {
  const { notes, isInitialized } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const router = useRouter();
  const decodedNoteId = decodeURIComponent(noteId);

  useEffect(() => {
    if (isInitialized) {
      const foundNote = notes.find(n => n.id === decodedNoteId);
      setNote(foundNote || null);
    }
  }, [isInitialized, decodedNoteId, notes]);

  if (!isInitialized || !note) {
    if (isInitialized && !note) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Note Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Sorry, the note "{decodedNoteId}" was not found in your list.</p>
                     <Button onClick={() => router.back()} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                </CardContent>
            </Card>
        )
    }
    return <LoadingSkeleton />;
  }


  return (
    <Card className="w-full mx-auto">
        <CardHeader>
            <div className="flex items-center gap-4">
                 <Button onClick={() => router.back()} variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Go Back</span>
                </Button>
                <CardTitle className="text-3xl font-bold font-headline break-words">
                    {note.title}
                </CardTitle>
            </div>
            <CardDescription className="pt-2 pl-14">
                 Created on {new Date(note.createdAt).toLocaleDateString()}
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="max-w-none text-base text-foreground/90 whitespace-pre-wrap break-words">
                {note.content}
            </div>
        </CardContent>
         <CardFooter>
            <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
            </Button>
        </CardFooter>
    </Card>
  );
}
