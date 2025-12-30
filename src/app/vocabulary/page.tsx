import { Header } from '@/components/layout/Header';
import { VocabularyList } from '@/components/VocabularyList';

export default function VocabularyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <VocabularyList />
      </main>
    </div>
  );
}
