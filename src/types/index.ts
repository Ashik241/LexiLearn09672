export type WordDifficulty = 'Easy' | 'Medium' | 'Hard' | 'New';

export type TestType = 
  | 'mcq' 
  | 'spelling_listen' 
  | 'spelling_meaning' 
  | 'bengali-to-english' 
  | 'synonym-antonym' 
  | 'dynamic'
  | 'fill_blank_word'
  | 'fill_blank_sentence'
  | 'verb_form';


export interface SynonymAntonym {
  word: string;
  meaning: string;
}

export interface VerbFormDetail {
    word: string;
    pronunciation: string;
    bangla_meaning: string;
    usage_timing: string; // Changed from usage_context
}

export interface VerbForms {
  v1_present: VerbFormDetail;
  v2_past: VerbFormDetail;
  v3_past_participle: VerbFormDetail;
  form_examples: {
    v1: string;
    v2: string;
    v3: string;
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
