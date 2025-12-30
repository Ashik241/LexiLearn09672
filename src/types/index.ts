export type WordDifficulty = 'Easy' | 'Medium' | 'Hard' | 'New';

export interface Word {
  id: string;
  word: string;
  syllables: string[];
  meaning: string;
  parts_of_speech: string;
  synonyms: string[];
  antonyms: string[];
  accent_uk: string;
  accent_us: string;
  example_sentences: string[];
  difficulty_level: WordDifficulty;
  is_learned: boolean;
  times_correct: number;
  times_incorrect: number;
  last_reviewed: string | null;
}
