import type { GrammarTopic } from '@/types';

export const initialGrammarData: GrammarTopic[] = [
  {
    "id": "t-001",
    "topic_name": "Nouns",
    "category": "Parts of Speech",
    "summary": "A noun is a word that names a person, place, thing, or idea. They are fundamental building blocks of sentences.",
    "short_trick": "If you can put 'a', 'an', or 'the' in front of it, it's probably a noun.",
    "details": [
      {
        "title": "Types of Nouns",
        "explanation": "<ul><li><b>Common Nouns:</b> General names (e.g., city, dog, book).</li><li><b>Proper Nouns:</b> Specific names, always capitalized (e.g., London, Max, 'War and Peace').</li><li><b>Concrete Nouns:</b> Things you can perceive with your five senses (e.g., table, music, fragrance).</li><li><b>Abstract Nouns:</b> Ideas, qualities, or states (e.g., love, courage, freedom).</li></ul>"
      },
      {
        "title": "Singular vs. Plural",
        "explanation": "Nouns can be singular (one) or plural (more than one). Most nouns are made plural by adding '-s' or '-es', but many irregular forms exist (e.g., child/children, mouse/mice)."
      }
    ],
    "examples": [
      "The <b>cat</b> sat on the <b>mat</b>.",
      "<b>Honesty</b> is the best <b>policy</b>.",
      "<b>Mr. Smith</b> went to <b>Paris</b>."
    ]
  },
  {
    "id": "t-002",
    "topic_name": "Verbs",
    "category": "Parts of Speech",
    "summary": "A verb is a word that expresses action or a state of being. Every complete sentence must have a verb.",
    "short_trick": "If it's something you can 'do', it's a verb.",
    "details": [
      {
        "title": "Action Verbs",
        "explanation": "These verbs show a physical or mental action (e.g., run, think, write)."
      },
      {
        "title": "Linking Verbs",
        "explanation": "These verbs connect the subject to a word or phrase that identifies or describes it. They don't show action. Common linking verbs include forms of 'to be' (is, am, are, was, were), 'become', and 'seem'."
      },
      {
        "title": "Helping Verbs",
        "explanation": "Also called auxiliary verbs, they help the main verb express tense, mood, or voice (e.g., have, do, will, can, should)."
      }
    ],
    "examples": [
      "She <b>runs</b> every morning.",
      "He <b>is</b> a talented musician.",
      "They <b>have been studying</b> for hours."
    ]
  },
  {
    "id": "t-003",
    "topic_name": "Subject-Verb Agreement",
    "category": "Sentence Structure",
    "summary": "The verb in a sentence must agree with its subject in number. Singular subjects take singular verbs, and plural subjects take plural verbs.",
    "short_trick": "Find the true subject. Ignore the words in between.",
    "details": [
      {
        "title": "Basic Rule",
        "explanation": "A singular subject (he, she, cat) takes a singular verb (is, goes, shines). A plural subject (they, we, cats) takes a plural verb (are, go, shine)."
      },
      {
        "title": "Compound Subjects",
        "explanation": "Subjects joined by 'and' are usually plural and take a plural verb. (e.g., 'The cat and the dog <b>are</b> friends.'). Subjects joined by 'or' or 'nor' take a verb that agrees with the subject closest to it (e.g., 'Neither the players nor the coach <b>is</b> happy.')."
      },
      {
        "title": "Interrupting Phrases",
        "explanation": "The verb agrees with the subject, not with a noun in a phrase that comes between the subject and the verb. (e.g., 'The box of apples <b>is</b> on the table.')."
      }
    ],
    "examples": [
      "The dog <b>barks</b> loudly.",
      "The dogs <b>bark</b> loudly.",
      "One of my friends <b>is</b> coming over."
    ]
  }
];
