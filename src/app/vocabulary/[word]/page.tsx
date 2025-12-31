import { WordDetailsClient } from './WordDetailsClient';

// This function is required for static exports of dynamic routes.
// Since our word data is purely client-side (in localStorage), we can't generate
// the paths at build time. Returning an empty array tells Next.js not to
// pre-build any pages for this route. Client-side navigation will handle
// rendering them on the fly.
export async function generateStaticParams() {
  return [];
}

export default function WordDetailsPage({ params }: { params: { word: string } }) {
  // The param is URL-encoded, so we decode it to get the actual word.
  const wordId = decodeURIComponent(params.word);
  
  // We pass the wordId to a Client Component which will handle all
  // data fetching and state management from localStorage.
  return <WordDetailsClient wordId={wordId} />;
}
