import type { Word, SynonymAntonym } from '@/types';

// Data provided by the user to be bulk-imported.
export const bulkWordsData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed' | 'verb_forms'>[] = [
  {
    "word": "Able",
    "meaning": "কোনো কিছু করতে সক্ষম বা দক্ষ।",
    "parts_of_speech": "Adjective",
    "synonyms": [
      {"word": "capable", "meaning": "সক্ষম"},
      {"word": "competent", "meaning": "যোগ্য"},
      {"word": "skilled", "meaning": "দক্ষ"}
    ],
    "antonyms": [
      {"word": "unable", "meaning": "অক্ষম"},
      {"word": "incapable", "meaning": "অযোগ্য"},
      {"word": "incompetent", "meaning": "অদক্ষ"}
    ],
    "syllables": ["a", "ble"],
    "example_sentences": [
      "She is able to speak four different languages.",
      "Will you be able to help me with my homework?"
    ]
  },
  {
    "word": "About",
    "meaning": "কোনো বিষয় সম্পর্কে বা প্রায় (সময়ের ক্ষেত্রে)।",
    "parts_of_speech": "Preposition",
    "synonyms": [
      {"word": "regarding", "meaning": "সম্পর্কে"},
      {"word": "concerning", "meaning": "বিষয়ে"},
      {"word": "around", "meaning": "প্রায়"}
    ],
    "antonyms": [
      {"word": "exactly", "meaning": "ঠিক"},
      {"word": "precisely", "meaning": "নির্ভুলভাবে"}
    ],
    "syllables": ["a", "bout"],
    "example_sentences": [
      "Tell me more about your new job.",
      "The movie is about to start in five minutes."
    ]
  },
  {
    "word": "Above",
    "meaning": "কোনো কিছুর উপরে কিন্তু স্পর্শ করে নেই এমন।",
    "parts_of_speech": "Preposition",
    "synonyms": [
      {"word": "over", "meaning": "উপরে"},
      {"word": "overhead", "meaning": "মাথার উপরে"},
      {"word": "higher than", "meaning": "এর চেয়ে উঁচু"}
    ],
    "antonyms": [
      {"word": "below", "meaning": "নিচে"},
      {"word": "under", "meaning": "তলায়"},
      {"word": "beneath", "meaning": "নিম্নে"}
    ],
    "syllables": ["a", "bove"],
    "example_sentences": [
      "The birds are flying high above the trees.",
      "Please write your name in the space above."
    ]
  },
  {
    "word": "Abroad",
    "meaning": "নিজের দেশের বাইরে বা বিদেশ।",
    "parts_of_speech": "Adverb",
    "synonyms": [
      {"word": "overseas", "meaning": "বিদেশে"},
      {"word": "away", "meaning": "দূরে"},
      {"word": "out of the country", "meaning": "দেশের বাইরে"}
    ],
    "antonyms": [
      {"word": "domestic", "meaning": "দেশীয়"},
      {"word": "home", "meaning": "ঘরে"},
      {"word": "locally", "meaning": "স্থানীয়ভাবে"}
    ],
    "syllables": ["a", "broad"],
    "example_sentences": [
      "He is planning to go abroad for higher studies.",
      "They have lived abroad for many years."
    ]
  }
];
