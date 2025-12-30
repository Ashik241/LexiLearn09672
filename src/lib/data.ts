import type { Word } from '@/types';

// This is a sample of words to seed the local storage on first load.
export const initialWordsData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed'>[] = [
  {
    word: 'ubiquitous',
    syllables: ['u', 'biq', 'ui', 'tous'],
    meaning: 'সর্বব্যাপী; যা সর্বত্র বিদ্যমান।',
    accent_uk: '/juːˈbɪk.wɪ.təs/',
    accent_us: '/juːˈbɪk.wə.t̬əs/',
    example_sentences: [
      'Coffee shops are ubiquitous in the city.',
      'The company\'s logo has become ubiquitous all over the world.'
    ]
  },
  {
    word: 'ephemeral',
    syllables: ['eph', 'em', 'er', 'al'],
    meaning: 'ক্ষণস্থায়ী; যা খুব অল্প সময়ের জন্য স্থায়ী হয়।',
    accent_uk: '/ɪˈfem.ər.əl/',
    accent_us: '/əˈfem.ər.əl/',
    example_sentences: [
      'Fashion trends are often ephemeral.',
      'The beauty of the cherry blossoms is ephemeral.'
    ]
  },
  {
    word: 'mellifluous',
    syllables: ['mel', 'lif', 'lu', 'ous'],
    meaning: 'সুমধুর; যা শুনতে খুব মিষ্টি বা সুরেলা।',
    accent_uk: '/məˈlɪf.lu.əs/',
    accent_us: '/məˈlɪf.lu.əs/',
    example_sentences: [
      'She had a mellifluous voice that soothed everyone.',
      'The mellifluous sound of the cello filled the room.'
    ]
  },
  {
    word: 'pulchritudinous',
    syllables: ['pul', 'chri', 'tu', 'di', 'nous'],
    meaning: 'অসাধারণ শারীরিক সৌন্দর্য সম্পন্ন।',
    accent_uk: '/ˌpʌl.krɪˈtjuː.dɪ.nəs/',
    accent_us: '/ˌpʌl.krəˈtuː.dən.əs/',
    example_sentences: [
        'The model was praised for her pulchritudinous appearance.',
        'He wrote a poem about his pulchritudinous beloved.'
    ]
  },
  {
    word: 'serendipity',
    syllables: ['ser', 'en', 'dip', 'i', 'ty'],
    meaning: 'আকস্মিকভাবে কোনো উপকারী জিনিস খুঁজে পাওয়ার সৌভাগ্য।',
    accent_uk: '/ˌser.ənˈdɪp.ə.ti/',
    accent_us: '/ˌser.ənˈdɪp.ə.t̬i/',
    example_sentences: [
        'Their meeting was pure serendipity.',
        'The discovery of penicillin was a case of serendipity.'
    ]
  },
  {
    word: 'eloquent',
    syllables: ['el', 'o', 'quent'],
    meaning: 'বাকপটু; যিনি বলা বা লেখায় পারদর্শী।',
    accent_uk: '/ˈel.ə.kwənt/',
    accent_us: '/ˈel.ə.kwənt/',
    example_sentences: [
        'The speaker delivered an eloquent speech about human rights.',
        'Her eloquent writing style captivated the readers.'
    ]
  },
  {
    word: 'profound',
    syllables: ['pro', 'found'],
    meaning: 'গভীর; যা খুব তীব্র বা জ্ঞানগর্ভ।',
    accent_uk: '/prəˈfaʊnd/',
    accent_us: '/prəˈfaʊnd/',
    example_sentences: [
        'The book had a profound impact on my thinking.',
        'He has a profound understanding of the subject.'
    ]
  },
  {
    word: 'resilience',
    syllables: ['re', 'sil', 'i', 'ence'],
    meaning: 'স্থিতিস্থাপকতা; কঠিন পরিস্থিতি থেকে দ্রুত স্বাভাবিক অবস্থায় ফিরে আসার ক্ষমতা।',
    accent_uk: '/rɪˈzɪl.i.əns/',
    accent_us: '/rɪˈzɪl.jəns/',
    example_sentences: [
        'The community showed great resilience after the natural disaster.',
        'Resilience is key to overcoming life\'s challenges.'
    ]
  },
];
