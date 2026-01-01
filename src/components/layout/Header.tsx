'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';
import { AddNoteDialog } from '../AddNoteDialog';
import { useState } from 'react';
import { SidebarTrigger } from '../ui/sidebar';

export function Header() {
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
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
          <div className="flex items-center gap-4">
            <Button onClick={() => setIsAddNoteOpen(true)}>
              <FilePlus className="mr-2 h-4 w-4" />
              নতুন নোট
            </Button>
          </div>
        </div>
      </header>
      <AddNoteDialog isOpen={isAddNoteOpen} onOpenChange={setIsAddNoteOpen} />
    </>
  );
}
