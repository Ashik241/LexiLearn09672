import type { Word } from '@/types';

// This is a sample of words to seed the local storage on first load.
export const initialWordsData: Omit<Word, 'id' | 'difficulty_level' | 'is_learned' | 'times_correct' | 'times_incorrect' | 'last_reviewed'>[] = [
  {
    word: 'ubiquitous',
    syllables: ['u', 'biq', 'ui', 'tous'],
    meaning: 'Present, appearing, or found everywhere.',
    accent_uk: '/juːˈbɪk.wɪ.təs/',
    accent_us: '/juːˈbɪk.wə.t̬əs/',
  },
  {
    word: 'ephemeral',
    syllables: ['eph', 'em', 'er', 'al'],
    meaning: 'Lasting for a very short time.',
    accent_uk: '/ɪˈfem.ər.əl/',
    accent_us: '/əˈfem.ər.əl/',
  },
  {
    word: 'mellifluous',
    syllables: ['mel', 'lif', 'lu', 'ous'],
    meaning: '(Of a voice or words) sweet or musical; pleasant to hear.',
    accent_uk: '/məˈlɪf.lu.əs/',
    accent_us: '/məˈlɪf.lu.əs/',
  },
  {
    word: 'pulchritudinous',
    syllables: ['pul', 'chri', 'tu', 'di', 'nous'],
    meaning: 'Having great physical beauty.',
    accent_uk: '/ˌpʌl.krɪˈtjuː.dɪ.nəs/',
    accent_us: '/ˌpʌl.krəˈtuː.dən.əs/',
  },
  {
    word: 'serendipity',
    syllables: ['ser', 'en', 'dip', 'i', 'ty'],
    meaning: 'The occurrence and development of events by chance in a happy or beneficial way.',
    accent_uk: '/ˌser.ənˈdɪp.ə.ti/',
    accent_us: '/ˌser.ənˈdɪp.ə.t̬i/',
  },
  {
    word: 'eloquent',
    syllables: ['el', 'o', 'quent'],
    meaning: 'Fluent or persuasive in speaking or writing.',
    accent_uk: '/ˈel.ə.kwənt/',
    accent_us: '/ˈel.ə.kwənt/',
  },
  {
    word: 'profound',
    syllables: ['pro', 'found'],
    meaning: '(Of a state, quality, or emotion) very great or intense.',
    accent_uk: '/prəˈfaʊnd/',
    accent_us: '/prəˈfaʊnd/',
  },
  {
    word: 'resilience',
    syllables: ['re', 'sil', 'i', 'ence'],
    meaning: 'The capacity to recover quickly from difficulties; toughness.',
    accent_uk: '/rɪˈzɪl.i.əns/',
    accent_us: '/rɪˈzɪl.jəns/',
  },
];
