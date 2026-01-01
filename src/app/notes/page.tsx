'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Notebook, Trash2, Pencil, Search, MoreHorizontal } from 'lucide-react';
import { useNotes } from '@/hooks/use-notes';
import type { Note } from '@/types';
import { AddNoteDialog } from '@/components/AddNoteDialog';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function NoteCard({ note, onEdit, onDelete }: { note: Note; onEdit: (note: Note) => void; onDelete: (note: Note) => void; }) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="break-words">{note.title}</CardTitle>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(note)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(note)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-muted-foreground whitespace-pre-wrap break-words">{note.content}</p>
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground">
                    Created: {new Date(note.createdAt).toLocaleDateString()}
                </p>
            </CardFooter>
        </Card>
    )
}


export default function NotesPage() {
    const { notes, isInitialized, deleteNote } = useNotes();
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
    const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    const filteredNotes = useMemo(() => {
        if (!searchQuery) return notes;
        return notes.filter(note => 
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [notes, searchQuery]);

    const handleEdit = (note: Note) => {
        setNoteToEdit(note);
        setIsAddNoteOpen(true);
    }
    
    const handleAddOrEditDialogChange = (open: boolean) => {
        setIsAddNoteOpen(open);
        if (!open) {
            setNoteToEdit(null);
        }
    }

    const confirmDelete = () => {
        if(noteToDelete) {
            deleteNote(noteToDelete.id);
            toast({
                title: "নোট মুছে ফেলা হয়েছে",
                description: `"${noteToDelete.title}" আপনার তালিকা থেকে মুছে ফেলা হয়েছে।`,
            });
            setNoteToDelete(null);
        }
    }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">নোট</h1>
                <p className="text-muted-foreground">আপনার ব্যক্তিগত নোট এখানে পরিচালনা করুন।</p>
            </div>
            <Button onClick={() => setIsAddNoteOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                নতুন নোট যোগ করুন
            </Button>
          </div>
          
           <div className="relative mb-6">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                    placeholder="নোট খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
               />
            </div>

          {isInitialized && filteredNotes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.map(note => (
                    <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={setNoteToDelete} />
                ))}
            </div>
          ) : (
             <Card className="w-full text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-4 w-20 h-20 flex items-center justify-center">
                        <Notebook className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="mt-4">
                        {searchQuery ? "কোনো নোট পাওয়া যায়নি" : "এখনও কোনো নোট নেই"}
                    </CardTitle>
                    <CardDescription>
                         {searchQuery 
                            ? "আপনার সার্চের সাথে মেলে এমন কোনো নোট পাওয়া যায়নি।" 
                            : "নতুন নোট যোগ করে শুরু করুন।"}
                    </CardDescription>
                </CardHeader>
            </Card>
          )}

        </main>
      </div>
       <AddNoteDialog 
            isOpen={isAddNoteOpen}
            onOpenChange={handleAddOrEditDialogChange}
            noteToEdit={noteToEdit}
        />
        <AlertDialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the note "{noteToDelete?.title}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setNoteToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
