import type { Word } from '@/types';

// Data provided by the user to be bulk-imported.
export const bulkWordsData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed' | 'accent_uk' | 'accent_us' | 'verb_forms'>[] = [
  {
    "word": "Able",
    "meaning": "কোনো কিছু করতে সক্ষম বা দক্ষ।",
    "parts_of_speech": "Adjective",
    "synonyms": ["capable", "competent", "skilled"],
    "antonyms": ["unable", "incapable", "incompetent"],
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
    "synonyms": ["regarding", "concerning", "around"],
    "antonyms": ["exactly", "precisely"],
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
    "synonyms": ["over", "overhead", "higher than"],
    "antonyms": ["below", "under", "beneath"],
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
    "synonyms": ["overseas", "away", "out of the country"],
    "antonyms": ["domestic", "home", "locally"],
    "syllables": ["a", "broad"],
    "example_sentences": [
      "He is planning to go abroad for higher studies.",
      "They have lived abroad for many years."
    ]
  }
];
