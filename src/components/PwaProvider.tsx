'use client';

import { type ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';

export function PwaProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !window.workbox
    ) {
      return;
    }
      const wb = window.workbox;

      // A common UX pattern for progressive web applications is to show a banner when a service worker has updated and waiting to install.
      // NOTE: MUST set skipWaiting: false in next.config.js for this to work.
      const promptNewVersionAvailable = (event: any) => {
        // `event.wasWaiting` is true if there's an existing service worker waiting.
        // You may want to customize the UI prompt accordingly.
        console.log(`A new service worker has installed, but it's waiting to activate. Can occur after new deployment.`, event);
        
        toast({
            title: 'একটি নতুন সংস্করণ উপলব্ধ!',
            description: 'অ্যাপটি রিলোড করে নতুন সংস্করণটি উপভোগ করুন।',
            duration: Infinity,
            action: <Button onClick={() => wb.messageSW({ type: 'SKIP_WAITING' })}>রিলোড</Button>
        });
      };
      
      wb.addEventListener('waiting', promptNewVersionAvailable);
      
      // Never forget to call register as automatic registration is removed in next-pwa > 4.0.0
      wb.register();
  }, [toast]);

  return <>{children}</>;
}
