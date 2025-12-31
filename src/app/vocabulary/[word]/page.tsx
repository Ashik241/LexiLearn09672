import { WordDetailsClient } from './WordDetailsClient';

export default function WordDetailsPage({ params }: { params: { word: string } }) {
  // The param is URL-encoded, so we decode it to get the actual word.
  const wordId = decodeURIComponent(params.word);
  
  // We pass the wordId to a Client Component which will handle all
  // data fetching and state management from localStorage.
  return <WordDetailsClient wordId={wordId} />;
}
