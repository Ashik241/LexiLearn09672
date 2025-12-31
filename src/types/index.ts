export type WordDifficulty = 'Easy' | 'Medium' | 'Hard' | 'New';

export interface SynonymAntonym {
  word: string;
  meaning: string;
}

export interface VerbFormDetail {
    word: string;
    pronunciation: string;
    bangla_meaning: string;
    usage_context: string;
}

export interface VerbForms {
  present: VerbFormDetail;
  past: VerbFormDetail;
  past_participle: VerbFormDetail;
  form_examples: {
    present: string;
    past: string;
    past_participle: string;
  };
}

export interface Word {
  id: string;
  word: string;
  syllables?: string[];
  meaning: string;
  meaning_explanation?: string;
  parts_of_speech: string;
  usage_distinction?: string;
  synonyms?: SynonymAntonym[];
  antonyms?: SynonymAntonym[];
  example_sentences?: string[];
  verb_forms?: VerbForms;
  difficulty_level: WordDifficulty;
  is_learned: boolean;
  times_correct: number;
  times_incorrect: number;
  last_reviewed: string | null;
  createdAt: string;
}
