'use client';

import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
    const handleRetry = () => {
        window.location.reload();
    }
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-destructive/10 rounded-full p-4 w-20 h-20 flex items-center justify-center">
                    <WifiOff className="w-10 h-10 text-destructive" />
                </div>
                <CardTitle className="mt-4">You are offline</CardTitle>
                <CardDescription>
                    It seems you are not connected to the internet. This app works offline, but this page requires a connection.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleRetry}>
                    Try Reloading
                </Button>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
