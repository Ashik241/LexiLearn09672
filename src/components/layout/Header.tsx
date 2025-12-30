import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';

export function Header() {
  return (
    <header className="py-4 px-4 md:px-8 border-b border-border/40 bg-card">
      <div className="container mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-8" />
          <span className="text-2xl font-bold font-headline text-foreground tracking-tight">
            LexiLearn
          </span>
        </Link>
      </div>
    </header>
  );
}
