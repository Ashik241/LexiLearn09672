export type WordDifficulty = 'Easy' | 'Medium' | 'Hard' | 'New';

export interface SynonymAntonym {
  word: string;
  meaning: string;
}

export interface VerbForms {
  present: string;
  past: string;
  past_participle: string;
  present_pronunciation: string;
  past_pronunciation: string;
  past_participle_pronunciation: string;
  form_examples: {
    present: string;
    past: string;
    past_participle: string;
  };
}

export interface Word {
  id: string;
  word: string;
  syllables: string[];
  meaning: string;
  parts_of_speech: string;
  synonyms: SynonymAntonym[];
  antonyms: SynonymAntonym[];
  example_sentences: string[];
  verb_forms?: VerbForms;
  difficulty_level: WordDifficulty;
  is_learned: boolean;
  times_correct: number;
  times_incorrect: number;
  last_reviewed: string | null;
}
