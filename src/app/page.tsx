'use client';

import { useState } from 'react';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInput } from '@/components/ui/sidebar';
import { useGrammar } from '@/hooks/use-grammar';
import type { GrammarTopic } from '@/types';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Search } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Placeholder for the main content view
function GrammarView({ topic }: { topic: GrammarTopic | null }) {
  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Welcome to the Grammar Handbook</h2>
        <p className="text-muted-foreground mt-2">Select a topic from the sidebar to get started.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{topic.topic_name}</CardTitle>
          <CardDescription className="text-md text-muted-foreground">{topic.category}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Summary</h3>
            <p className="text-foreground/80">{topic.summary}</p>
          </div>
          
          {topic.short_trick && (
             <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Short Trick</h3>
                <p className="text-primary font-medium">{topic.short_trick}</p>
            </div>
          )}
          
          {topic.details && topic.details.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Details</h3>
              <Accordion type="single" collapsible className="w-full">
                {topic.details.map((detail, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{detail.title}</AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: detail.explanation }}></div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {topic.examples && topic.examples.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Examples</h3>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                {topic.examples.map((example, i) => (
                  <li key={i} className="break-words">{example}</li>
                ))}
              </ul>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}


export default function Home() {
  const { topics, isInitialized } = useGrammar();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<GrammarTopic | null>(null);

  const filteredTopics = topics.filter(topic =>
    topic.topic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider>
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <div className="flex flex-1">
                <Sidebar>
                    <SidebarHeader>
                         <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <SidebarInput 
                                placeholder="Filter topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                           />
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            {isInitialized ? filteredTopics.map((topic) => (
                                <SidebarMenuItem key={topic.id}>
                                    <SidebarMenuButton 
                                        onClick={() => setActiveTopic(topic)}
                                        isActive={activeTopic?.id === topic.id}
                                    >
                                        <FileText />
                                        <span>{topic.topic_name}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )) : (
                                <p className="p-2 text-sm text-muted-foreground">Loading topics...</p>
                            )}
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>
                <SidebarInset className="flex-1">
                   <GrammarView topic={activeTopic} />
                </SidebarInset>
            </div>
        </div>
    </SidebarProvider>
  );
}
