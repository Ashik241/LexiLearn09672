'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';
import { AddWordDialog } from '../AddWordDialog';
import { useState } from 'react';
import { SidebarTrigger } from '../ui/sidebar';

export function Header() {
  const [isAddWordOpen, setIsAddWordOpen] = useState(false);
  return (
    <>
      <header className="py-4 px-4 md:px-8 border-b border-border/40 bg-card">
        <div className="container mx-auto flex justify-between items-center">
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
            <Button onClick={() => setIsAddWordOpen(true)}>
              <FilePlus className="mr-2 h-4 w-4" />
              নতুন শব্দ
            </Button>
          </div>
        </div>
      </header>
      <AddWordDialog isOpen={isAddWordOpen} onOpenChange={setIsAddWordOpen} />
    </>
  );
}
