
# Comprehensive Prompt for Recreating LexiLearn App in Flutter

## 1. App Overview & Core Concept

You are tasked with building "LexiLearn," a modern, offline-first vocabulary learning application using Flutter. The primary goal is to help users build, manage, and revise their English vocabulary with Bengali meanings. The app should be clean, intuitive, and highly functional, ensuring a seamless user experience on both Android and iOS. All user data (words and notes) must be stored locally on the device to ensure full offline capability.

**Core Principles:**
- **Offline-First:** The app must be 100% functional without an internet connection.
- **State Management:** Use **Provider** for state management. It's a simple, flexible, and widely-used solution that is perfect for this application's needs.
- **Local Storage:** Use **SQLite** via the `sqflite` package for storing words and notes. SQLite is a robust, serverless, transactional SQL database engine perfect for structured data.
- **UI/UX:** A clean, modern, and responsive UI. Use Material 3 design principles.

---

## 2. Data Models (Dart)

Define the following Dart classes to represent the application's data structure. These classes should include `toMap()` and `fromMap()` methods to facilitate conversion between Dart objects and SQLite records. Complex nested objects (like lists or custom classes) should be stored as JSON strings in the database.

```dart
// file: lib/models/word.dart
import 'dart:convert';

class Word {
  String id; // Lowercase word as a unique ID
  String word;
  String meaning; // Bengali Meaning
  String partsOfSpeech;
  String difficultyLevel; // 'New', 'Hard', 'Medium', 'Easy'
  bool isLearned;
  int timesCorrect;
  int timesIncorrect;
  DateTime lastReviewed;
  DateTime createdAt;
  String? meaningExplanation;
  String? usageDistinction;
  List<String>? syllables;
  List<SynonymAntonym>? synonyms;
  List<SynonymAntonym>? antonyms;
  List<String>? exampleSentences;
  VerbForms? verbForms;
  int spellingError;
  int meaningError;
  int grammarError;

  Word({
    required this.id,
    required this.word,
    required this.meaning,
    required this.partsOfSpeech,
    required this.difficultyLevel,
    required this.isLearned,
    required this.timesCorrect,
    required this.timesIncorrect,
    required this.lastReviewed,
    required this.createdAt,
    this.meaningExplanation,
    this.usageDistinction,
    this.syllables,
    this.synonyms,
    this.antonyms,
    this.exampleSentences,
    this.verbForms,
    this.spellingError = 0,
    this.meaningError = 0,
    this.grammarError = 0,
  });
  
  // Convert a Word object into a Map. The keys must correspond to the names of the
  // columns in the database.
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'word': word,
      'meaning': meaning,
      'partsOfSpeech': partsOfSpeech,
      'difficultyLevel': difficultyLevel,
      'isLearned': isLearned ? 1 : 0,
      'timesCorrect': timesCorrect,
      'timesIncorrect': timesIncorrect,
      'lastReviewed': lastReviewed.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'meaningExplanation': meaningExplanation,
      'usageDistinction': usageDistinction,
      'syllables': syllables != null ? jsonEncode(syllables) : null,
      'synonyms': synonyms != null ? jsonEncode(synonyms?.map((s) => s.toMap()).toList()) : null,
      'antonyms': antonyms != null ? jsonEncode(antonyms?.map((a) => a.toMap()).toList()) : null,
      'exampleSentences': exampleSentences != null ? jsonEncode(exampleSentences) : null,
      'verbForms': verbForms?.toJson(),
      'spellingError': spellingError,
      'meaningError': meaningError,
      'grammarError': grammarError,
    };
  }

  // Implement a factory constructor for creating a new Word instance from a map.
  factory Word.fromMap(Map<String, dynamic> map) {
    return Word(
      id: map['id'],
      word: map['word'],
      meaning: map['meaning'],
      partsOfSpeech: map['partsOfSpeech'],
      difficultyLevel: map['difficultyLevel'],
      isLearned: map['isLearned'] == 1,
      timesCorrect: map['timesCorrect'],
      timesIncorrect: map['timesIncorrect'],
      lastReviewed: DateTime.parse(map['lastReviewed']),
      createdAt: DateTime.parse(map['createdAt']),
      meaningExplanation: map['meaningExplanation'],
      usageDistinction: map['usageDistinction'],
      syllables: map['syllables'] != null ? List<String>.from(jsonDecode(map['syllables'])) : null,
      synonyms: map['synonyms'] != null ? (jsonDecode(map['synonyms']) as List).map((s) => SynonymAntonym.fromMap(s)).toList() : null,
      antonyms: map['antonyms'] != null ? (jsonDecode(map['antonyms']) as List).map((a) => SynonymAntonym.fromMap(a)).toList() : null,
      exampleSentences: map['exampleSentences'] != null ? List<String>.from(jsonDecode(map['exampleSentences'])) : null,
      verbForms: map['verbForms'] != null ? VerbForms.fromJson(map['verbForms']) : null,
      spellingError: map['spellingError'] ?? 0,
      meaningError: map['meaningError'] ?? 0,
      grammarError: map['grammarError'] ?? 0,
    );
  }
}

class SynonymAntonym {
  String word;
  String meaning;

  SynonymAntonym({required this.word, required this.meaning});
  
  Map<String, dynamic> toMap() => {'word': word, 'meaning': meaning};
  factory SynonymAntonym.fromMap(Map<String, dynamic> map) => SynonymAntonym(word: map['word'], meaning: map['meaning']);
}

class VerbForms {
  VerbFormDetail v1Present;
  VerbFormDetail v2Past;
  VerbFormDetail v3PastParticiple;
  FormExamples formExamples;
  
  VerbForms({required this.v1Present, required this.v2Past, required this.v3PastParticiple, required this.formExamples});
  
  String toJson() => jsonEncode({
    'v1_present': v1Present.toMap(),
    'v2_past': v2Past.toMap(),
    'v3_past_participle': v3PastParticiple.toMap(),
    'form_examples': formExamples.toMap(),
  });
  
  factory VerbForms.fromJson(String source) {
    final map = jsonDecode(source);
    return VerbForms(
      v1Present: VerbFormDetail.fromMap(map['v1_present']),
      v2Past: VerbFormDetail.fromMap(map['v2_past']),
      v3PastParticiple: VerbFormDetail.fromMap(map['v3_past_participle']),
      formExamples: FormExamples.fromMap(map['form_examples']),
    );
  }
}

class VerbFormDetail {
  String word;
  String pronunciation;
  String banglaMeaning;
  String usageTiming;

  VerbFormDetail({required this.word, required this.pronunciation, required this.banglaMeaning, required this.usageTiming});
  
  Map<String, dynamic> toMap() => {'word': word, 'pronunciation': pronunciation, 'bangla_meaning': banglaMeaning, 'usage_timing': usageTiming};
  factory VerbFormDetail.fromMap(Map<String, dynamic> map) => VerbFormDetail(word: map['word'], pronunciation: map['pronunciation'], banglaMeaning: map['bangla_meaning'], usageTiming: map['usage_timing']);
}

class FormExamples {
  String v1;
  String v2;
  String v3;

  FormExamples({required this.v1, required this.v2, required this.v3});
  
  Map<String, dynamic> toMap() => {'v1': v1, 'v2': v2, 'v3': v3};
  factory FormExamples.fromMap(Map<String, dynamic> map) => FormExamples(v1: map['v1'], v2: map['v2'], v3: map['v3']);
}

// file: lib/models/note.dart
class Note {
  String id; // Lowercase title with dashes as unique ID
  String title;
  String content;
  DateTime createdAt;

  Note({required this.id, required this.title, required this.content, required this.createdAt});
  
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Note.fromMap(Map<String, dynamic> map) {
    return Note(
      id: map['id'],
      title: map['title'],
      content: map['content'],
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}
```

---

## 3. Core Logic & Data Management (Provider/Repository)

Create a repository and `ChangeNotifier` providers for managing `Word` and `Note` data.

### `DatabaseHelper` (Singleton)
- **Responsibilities:** Manage database connection. Create tables.
- **Methods:**
  - `Future<Database> get database`: Get the singleton database instance.
  - `Future<void> _initDB()`: Initialize the database and create tables if they don't exist.
- **Table Schemas:**
  - **words_table:** `id TEXT PRIMARY KEY`, `word TEXT`, `meaning TEXT`, `partsOfSpeech TEXT`, `difficultyLevel TEXT`, `isLearned INTEGER`, `timesCorrect INTEGER`, `timesIncorrect INTEGER`, `lastReviewed TEXT`, `createdAt TEXT`, `meaningExplanation TEXT`, `usageDistinction TEXT`, `syllables TEXT`, `synonyms TEXT`, `antonyms TEXT`, `exampleSentences TEXT`, `verbForms TEXT`, `spellingError INTEGER`, `meaningError INTEGER`, `grammarError INTEGER`
  - **notes_table:** `id TEXT PRIMARY KEY`, `title TEXT`, `content TEXT`, `createdAt TEXT`

### `VocabularyRepository`
- **Responsibilities:** Direct interaction with the SQLite database for words.
- **Methods:**
  - `Future<List<Word>> getAllWords()`: Get all words, sorted alphabetically.
  - `Future<Word?> getWordById(String id)`: Get a single word.
  - `Future<bool> addWord(WordData data)`: Add a new word. Return `false` if it already exists. Use `db.insert` with `conflictAlgorithm: ConflictAlgorithm.ignore`.
  - `Future<void> updateWord(String id, WordUpdates updates)`: Update an existing word. Use `db.update`.
  - `Future<void> deleteWord(String id)`: Delete a word. Use `db.delete`.
  - `Future<{int added, int skipped}> addMultipleWords(List<WordData> words)`: Bulk import words using a transaction (`db.transaction`).

### `NotesRepository`
- **Responsibilities:** Direct interaction with the SQLite database for notes.
- **Methods:** Similar CRUD operations for `Note` objects using `sqflite`.

### `VocabularyProvider` & `NotesProvider` (`ChangeNotifier`)
- These classes will extend `ChangeNotifier`.
- They will use their respective repositories to fetch and manage data.
- They hold the application state (e.g., `List<Word> words`, `List<Note> notes`, loading status).
- Methods like `fetchWords()`, `addWord()`, `deleteNote()` will perform the operation using the repository and then call `notifyListeners()` to update the UI.

---

## 4. UI Pages and Components

Build the following pages and widgets. Use `Consumer` or `context.watch<MyProvider>()` to listen to changes and rebuild the UI.

### Main Layout (`MainScreen.dart`)
- A `Scaffold` with a `BottomNavigationBar`.
- **Navigation Items:**
  1. **Dashboard** (`Icons.dashboard`)
  2. **Words List** (`Icons.list_alt`)
  3. **Exam** (`Icons.school`)
  4. **Performance** (`Icons.show_chart`)
  5. **Notes** (`Icons.note`)
- An `AppBar` with the title "LexiLearn" and two action buttons:
  - **Add Word** (`Icons.add_circle_outline`): Opens the "Add Word" dialog.
  - **Add Note** (`Icons.note_add_outlined`): Opens the "Add Note" dialog.
- The root of the app (`main.dart`) should wrap the `MaterialApp` with `MultiProvider` to make `VocabularyProvider` and `NotesProvider` available throughout the widget tree.

### Page 1: Dashboard (`DashboardPage.dart`)
- **UI:** A `ListView` or `Column` with padding.
  - **Header:** "Dashboard" title and a subtitle "আপনার শেখার অগ্রগতি এবং পরিসংখ্যান এক নজরে দেখুন।"
  - **Stats Grid:** A responsive grid (`GridView` or `Wrap`) of cards displaying key statistics. Each card should contain an icon, title, value, and a short description.
    - **Stats to show:** Total Words, Learned Words, Overall Accuracy, Hard Words, Medium Words, Easy Words, Today's Words.
    - **Card Content:**
        - **Total Words:** Icon: `Icons.inventory_2_outlined`, Title: "Total Words", Description: "The total number of words in your vocabulary."
        - **Learned Words:** Icon: `Icons.check_circle_outline`, Title: "Learned Words", Description: "Words you've marked as 'Easy'."
        - **Overall Accuracy:** Icon: `Icons.percent`, Title: "Overall Accuracy", Description: "Your accuracy across all sessions."
        - **Hard Words:** Icon: `Icons.shield_alert_outlined` (Red color), Title: "Hard", Description: "Number of words in the 'Hard' category."
        - **Medium Words:** Icon: `Icons.help_outline` (Yellow color), Title: "Medium", Description: "Number of words in the 'Medium' category."
        - **Easy Words:** Icon: `Icons.check` (Green color), Title: "Easy", Description: "Number of words in the 'Easy' category."
        - **Today's Words:** Icon: `Icons.today`, Title: "Today's Words", Description: "Number of new words added today."
    - **Functionality:** All stat cards should be tappable. Tapping a card navigates to the `Words List` page with the corresponding filter applied (e.g., tapping 'Hard' filters the list to show only hard words).
  - **Quick Actions Section:** A section with a title "Quick Actions".
    - **"Revision" Card:** A card with a title "Revision" (`Icons.auto_stories`), a description "আপনার কঠিন এবং মাঝারি শব্দগুলো ঝালিয়ে নিন।", and a "Start Revision" button. This navigates to the `Exam` page to start a session with 'Hard' and 'Medium' words.
    - **"Words List" Card:** A card with a title "Words List" (`Icons.list_alt`), a description "আপনার শব্দভান্ডারে থাকা সমস্ত শব্দ ব্রাউজ করুন।", and a "View List" button. This navigates to the `Words List` page.

### Page 2: Words List (`VocabularyListPage.dart`)
- **UI:** A `Scaffold` containing a `Card` with a list of words.
  - **Header:** A title (e.g., "Words List"), a search bar, and a filter button.
  - **Search Bar:** Filters the list of words in real-time by word, meaning, synonyms, etc.
  - **Filter Button:** A dropdown to filter words by Part of Speech.
  - **Exam Button:** If a filter is active, show a button to start an exam with the filtered words.
  - **Word List:** A `ListView.builder` displaying `WordListItem` widgets.
    - If the list is empty, show a centered message.
  - **`WordListItem` Widget:**
    - A `ListTile` or `Card` showing the word, its meaning, and part of speech.
    - A `Badge` on the right to show the word's difficulty level, colored accordingly (Hard: Red, Medium: Yellow, Easy: Green, New: Grey).
    - A trailing `PopupMenuButton` (`Icons.more_vert`) with "Edit" and "Delete" options.
    - Tapping the item navigates to the `WordDetailsPage`.

### Page 3: Exam (`LearnPage.dart`)
- **UI:** This page is the core of the learning experience.
  - **Filter Controls:** Two dropdowns at the top:
    1. **Filter by Difficulty:** "All Words", "Today's Words", "Hard Words", etc.
    2. **Filter by Exam Type:** "Dynamic", "MCQ", "Spelling Test", etc.
  - **Learning Client:** A central stateful widget that manages the session.
    - **States:** `loading`, `testing`, `feedback`, `finished`.
    - **Logic:**
      1. Fetch a word based on the selected filters and the smart revision algorithm (prioritize 'Hard'/'Medium' and least recently reviewed).
      2. Based on the selected exam type (or a random one if 'Dynamic' is chosen), render the appropriate test widget.
      3. When the test is completed, show the `FeedbackScreen`.
      4. On `FeedbackScreen`, after the user proceeds, load the next word.
      5. If no more words are available, show the `finished` state.
- **Test Widgets (`McqTest.dart`, `SpellingTest.dart`, etc.):**
  - **MCQ Test:** Show a question and 4 tappable options.
  - **Spelling Test:** Provide a text field. Can be in "listen" mode (with a Text-to-Speech button) or "meaning" mode (showing the Bengali meaning).
  - **Verb Form Test:** Provide two text fields for V2 and V3 forms.
  - **Fill in the Blanks (Sentence):** Show an example sentence with the word blanked out.
- **Feedback Screen (`FeedbackScreen.dart`):**
  - Shows if the answer was "Correct" (Green Check) or "Incorrect" (Red Cross).
  - Displays the correct word, its meaning, and example sentences.
  - A "Next Word" button to continue the session.

### Page 4: Performance (`PerformancePage.dart`)
- **UI:** A dashboard with charts and lists.
  - **Error Distribution:** A `PieChart` showing the distribution of `spelling_error`, `meaning_error`, and `grammar_error`.
  - **Hardest Words:** A `Card` with a `ListView` of the top 3-5 most frequently incorrect words. Tapping navigates to the `WordDetailsPage`.
  - **7-Day Progress:** A `LineChart` showing the trend of errors over the last 7 days (this requires storing historical stats, which is an advanced feature).

### Page 5: Notes (`NotesPage.dart`)
- **UI:** A `Scaffold` displaying a grid of notes.
  - **Search Bar:** To filter notes by title or content.
  - **Notes Grid:** A `GridView.builder` of `NoteCard` widgets.
  - **`NoteCard` Widget:** A card showing the note's title and a snippet of its content. Tapping opens the `NoteDetailsPage`.
  - **FAB (Floating Action Button):** An `FloatingActionButton` with `Icons.add` to open the "Add Note" dialog.

### Other Important UI Components:

#### `WordDetailsPage.dart`
- **UI:** A `Scaffold` wrapping a `SingleChildScrollView` that contains a `Card` widget for the main content. The card will have padding and display all details of a single word.
- **`CardHeader`:**
  - A `Row` containing a `Column` for text and a `Row` for controls.
  - **Left Column:**
    - The `word` in a large, bold font (`headlineMedium` style), colored with the primary theme color.
    - The `parts_of_speech` below the word in a smaller, muted color.
  - **Right Controls:**
    - An `IconButton` (`Icons.volume_up_outlined`) to pronounce the word.
    - An `IconButton` (`Icons.settings_outlined`) that opens a small pop-up/modal to control pronunciation settings.
      - **Pronunciation Pop-up:** Contains a `RadioListTile` for US/UK accent, and `Slider` widgets for speed and volume.
    - A `Chip` widget to display the `difficultyLevel` with appropriate background colors (e.g., Hard: red, Medium: yellow, Easy: green).
- **`CardContent`:** Use a `Column` with `SizedBox` for spacing between sections.
  - **Meaning Section:**
    - "Meaning (Bangla)" title.
    - The `meaning` in a slightly larger font.
  - **Meaning Explanation Section (if exists):**
    - A `Card` with a light background color (e.g., `Colors.blue.shade50`).
    - "Meaning Explanation" title.
    - The `meaningExplanation` text, formatted as an italic quote.
  - **Usage Distinction Section (if exists):** Similar to the meaning explanation section.
  - **Syllables Section:**
    - "Syllables" title.
    - `syllables` list joined with a ' · ' separator, displayed in a code-style font.
  - **Synonyms & Antonyms Section:**
    - A `Row` or `Wrap` widget.
    - **Synonyms (if exist):** "Synonyms" title. Display synonyms as `ActionChip` widgets. Each chip is tappable to pronounce the synonym. The chip should show the `word` and optionally the `meaning` below it.
    - **Antonyms (if exist):** "Antonyms" title. Similar UI to synonyms but with a different chip style (e.g., `outlined`).
  - **Example Sentences Section (if exists):**
    - "Example Sentences" title.
    - A `Column` of `ListTile` widgets, each with a leading bullet point icon and the sentence text.
  - **Verb Forms Section (if it's a verb):**
    - A `Divider` followed by a "Verb Forms" title.
    - A `DataTable` or a custom `Table` to display the verb forms (V1, V2, V3).
    - **Table Columns:** "Form", "Word & Pronunciation", "Bengali Meaning", "Usage Timing".
    - **Table Rows:** Each row will represent a verb form (Present, Past, Past Participle). The "Word & Pronunciation" cell should contain the verb form and a small `IconButton` to pronounce it.
    - Below the table, display the `form_examples` for V1, V2, and V3.

#### Dialogs (`AddWordDialog.dart`, `AddNoteDialog.dart`)
- Use `showDialog` to present a modal.
- **`AddWordDialog`:**
  - Implement a `Tabbed` view for "Add Single" vs. "Bulk Import from JSON".
  - **Add Single Tab:** Use a `Form` with `TextFormField` widgets and validation for all `Word` properties (word, meaning, parts of speech, etc., including optional verb forms).
  - **Bulk Import Tab:**
    - Provide a multi-line `TextFormField` for pasting JSON data.
    - On submit, parse the JSON. It should handle an array of word objects.
    - Use the `VocabularyRepository`'s `addMultipleWords` method to import the data in a single transaction.
    - Show a `SnackBar` or `Toast` with the result (e.g., "5 words added, 2 duplicates skipped.").
- **`AddNoteDialog`:**
  - A simpler dialog with a `Form`, a `TextFormField` for the title, and a multi-line `TextFormField` for the content.

---

## 5. PWA & Offline Support

- **Service Worker:** While Flutter Web supports PWA, the primary focus is on mobile. The offline-first architecture with SQLite is sufficient for mobile.
- **Dependencies:**
  - `sqflite`: For SQLite database interaction.
  - `path`: For finding the correct local path to store the database file.
  - `provider`: For state management.
  - `flutter_tts`: For text-to-speech.
  - `json_serializable` (optional, for complex data models)
  - `fl_chart`: For charts.

This prompt provides a complete blueprint for developing the LexiLearn app in Flutter, mirroring the functionality of the existing Next.js version using SQLite as the local database and Provider for state management. Good luck!
