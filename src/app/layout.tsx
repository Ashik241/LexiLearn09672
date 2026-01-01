import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { PwaProvider } from '@/components/PwaProvider';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Home, List, BarChart3, Notebook } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';

export const metadata: Metadata = {
  title: 'LexiLearn - Build Your Vocabulary',
  description: 'An offline-first vocabulary builder PWA made with Next.js.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


const navItems = [
  { href: '/', label: 'ড্যাশবোর্ড', icon: Home },
  { href: '/vocabulary', label: 'শব্দভান্ডার', icon: List },
  { href: '/learn', label: 'শিখুন', icon: BarChart3 },
  { href: '/notes', label: 'নোট', icon: Notebook },
];

function AppSidebar() {
  return (
      <Sidebar>
          <SidebarHeader>
              <Link href="/" className="flex items-center gap-3">
                <Logo className="h-8 w-8" />
                <span className="text-2xl font-bold font-headline text-foreground tracking-tight">
                  LexiLearn
                </span>
              </Link>
          </SidebarHeader>
          <SidebarContent>
              <SidebarMenu>
                {navItems.map(item => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                      <SidebarMenuButton>
                        <item.icon />
                        {item.label}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
          </SidebarContent>
      </Sidebar>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
      </head>
      <body className={cn('font-body antialiased flex flex-col', 'min-h-screen')} suppressHydrationWarning>
        <SidebarProvider>
            <div className="flex flex-1">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                  <PwaProvider>{children}</PwaProvider>
                </div>
            </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
