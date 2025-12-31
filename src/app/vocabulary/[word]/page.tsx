import { WordDetailsClient } from './WordDetailsClient';

// This function is required for static export with dynamic routes.
// It tells Next.js what pages to pre-render at build time.
// Since our data is purely client-side, we return an empty array
// and handle rendering on the client via dynamic routes.
export async function generateStaticParams() {
  return [];
}

// Setting dynamic to 'force-dynamic' is not strictly necessary with an empty
// generateStaticParams, but it makes the intention clear that these pages are
// rendered on demand on the client.
export const dynamic = 'force-dynamic';

export default function WordDetailsPage({ params }: { params: { word: string } }) {
  const wordId = decodeURIComponent(params.word);
  return <WordDetailsClient wordId={wordId} />;
}
