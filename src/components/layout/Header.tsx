'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { FilePlus, NotebookPen } from 'lucide-react';
import { AddNoteDialog } from '../AddNoteDialog';
import { AddWordDialog } from '../AddWordDialog';
import { useState } from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function Header() {
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isAddWordOpen, setIsAddWordOpen] = useState(false);
  
  return (
    <>
      <header className="py-4 px-4 md:px-8 border-b border-border/40 bg-card">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <SidebarTrigger className="md:hidden" />
            <Link href="/" className="flex items-center gap-3">
              <Logo className="h-8 w-8" />
              <span className="text-2xl font-bold font-headline text-foreground tracking-tight">
                LexiLearn
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setIsAddWordOpen(true)}>
                            <FilePlus className="h-5 w-5" />
                            <span className="sr-only">Add New Word</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add New Word</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" onClick={() => setIsAddNoteOpen(true)}>
                            <NotebookPen className="h-5 w-5" />
                            <span className="sr-only">Add New Note</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add New Note</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>
      <AddNoteDialog isOpen={isAddNoteOpen} onOpenChange={setIsAddNoteOpen} />
      <AddWordDialog isOpen={isAddWordOpen} onOpenChange={setIsAddWordOpen} />
    </>
  );
}
