import { WordDetailsClient } from './WordDetailsClient';

// This function tells Next.js that we don't want to pre-render any
// specific word pages at build time. They will be generated on demand
// on the client side.
export async function generateStaticParams() {
  return [];
}

// This is crucial for `output: 'export'`. It allows Next.js to handle
// dynamic segments (like a new `word`) that were not generated at build time.
// It will render a fallback page on the client and then fetch the data.
export const dynamicParams = true;


export default function WordDetailsPage({ params }: { params: { word: string } }) {
  // The param is URL-encoded, so we decode it to get the actual word.
  const wordId = decodeURIComponent(params.word);
  
  // We pass the wordId to a Client Component which will handle all
  // data fetching and state management from localStorage.
  return <WordDetailsClient wordId={wordId} />;
}
