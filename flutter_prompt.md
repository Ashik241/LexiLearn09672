
# Comprehensive Prompt for Recreating LexiLearn App in Flutter

## 1. App Overview & Core Concept

You are tasked with building "LexiLearn," a modern, offline-first vocabulary learning application using Flutter. The primary goal is to help users build, manage, and revise their English vocabulary with Bengali meanings. The app should be clean, intuitive, and highly functional, ensuring a seamless user experience on both Android and iOS. All user data (words and notes) must be stored locally on the device to ensure full offline capability.

**Core Principles:**
- **Offline-First:** The app must be 100% functional without an internet connection.
- **State Management:** Use a robust state management solution like **Provider**, **BLoC/Cubit**, or **Riverpod**. The examples below will use a BLoC-like approach for separation of concerns.
- **Local Storage:** Use a reliable local database like **Hive** or **Drift (Moor)** for storing words and notes. Hive is preferred for its speed and simplicity with Dart objects.
- **UI/UX:** A clean, modern, and responsive UI. Use Material 3 design principles.

---

## 2. Data Models (Dart)

Define the following Dart classes to represent the application's data structure. Use a code generation library like `json_serializable` and `hive_generator` for type safety and database integration.

```dart
// file: lib/models/word.dart
import 'package:hive/hive.dart';

part 'word.g.dart';

@HiveType(typeId: 0)
class Word extends HiveObject {
  @HiveField(0)
  String id; // Lowercase word as a unique ID

  @HiveField(1)
  String word;

  @HiveField(2)
  String meaning; // Bengali Meaning

  @HiveField(3)
  String partsOfSpeech;

  @HiveField(4)
  String difficultyLevel; // 'New', 'Hard', 'Medium', 'Easy'

  @HiveField(5)
  bool isLearned;

  @HiveField(6)
  int timesCorrect;

  @HiveField(7)
  int timesIncorrect;

  @HiveField(8)
  DateTime lastReviewed;

  @HiveField(9)
  DateTime createdAt;

  @HiveField(10)
  String? meaningExplanation;

  @HiveField(11)
  String? usageDistinction;

  @HiveField(12)
  List<String>? syllables;

  @HiveField(13)
  List<SynonymAntonym>? synonyms;

  @HiveField(14)
  List<SynonymAntonym>? antonyms;

  @HiveField(15)
  List<String>? exampleSentences;

  @HiveField(16)
  VerbForms? verbForms;

  @HiveField(17)
  int spellingError;

  @HiveField(18)
  int meaningError;
  
  @HiveField(19)
  int grammarError;

  Word({/* ... constructor ... */});
}

@HiveType(typeId: 1)
class SynonymAntonym extends HiveObject {
  @HiveField(0)
  String word;
  @HiveField(1)
  String meaning;

  SynonymAntonym({required this.word, required this.meaning});
}

@HiveType(typeId: 2)
class VerbForms extends HiveObject {
  @HiveField(0)
  VerbFormDetail v1Present;
  @HiveField(1)
  VerbFormDetail v2Past;
  @HiveField(2)
  VerbFormDetail v3PastParticiple;
  @HiveField(3)
  FormExamples formExamples;
  
  VerbForms({/* ... constructor ... */});
}

@HiveType(typeId: 3)
class VerbFormDetail extends HiveObject {
  @HiveField(0)
  String word;
  @HiveField(1)
  String pronunciation;
  @HiveField(2)
  String banglaMeaning;
  @HiveField(3)
  String usageTiming;

  VerbFormDetail({/* ... constructor ... */});
}

@HiveType(typeId: 4)
class FormExamples extends HiveObject {
  @HiveField(0)
  String v1;
  @HiveField(1)
  String v2;
  @HiveField(2)
  String v3;

  FormExamples({/* ... constructor ... */});
}

// file: lib/models/note.dart
import 'package:hive/hive.dart';

part 'note.g.dart';

@HiveType(typeId: 5)
class Note extends HiveObject {
  @HiveField(0)
  String id; // Lowercase title with dashes as unique ID

  @HiveField(1)
  String title;

  @HiveField(2)
  String content;

  @HiveField(3)
  DateTime createdAt;

  Note({/* ... constructor ... */});
}
```

---

## 3. Core Logic & Data Management (BLoC/Repository)

Create a repository and BLoC/Cubit for managing `Word` and `Note` data.

### `VocabularyRepository`
- **Responsibilities:** Direct interaction with the Hive database.
- **Methods:**
  - `Future<void> init()`: Initialize Hive and open boxes.
  - `List<Word> getAllWords()`: Get all words, sorted alphabetically.
  - `Word? getWordById(String id)`: Get a single word.
  - `Future<bool> addWord(WordData data)`: Add a new word. Return `false` if it already exists.
  - `Future<void> updateWord(String id, WordUpdates updates)`: Update an existing word.
  - `Future<void> deleteWord(String id)`: Delete a word.
  - `Future<{int added, int skipped}> addMultipleWords(List<WordData> words)`: Bulk import words.
  - `void calculateStats()`: A method that computes all statistics and pushes them to a `Stream`.
  - `Stream<Stats> get statsStream`: A stream that emits updated stats.
- **Statistics Logic:** `calculateStats` should compute total words, learned words, accuracy, word counts by difficulty, and error type counts.

### `NotesRepository`
- **Responsibilities:** Direct interaction with the Hive database for notes.
- **Methods:** Similar CRUD operations for `Note` objects.

### `VocabularyBloc` / `NotesBloc`
- These BLoCs will use their respective repositories to manage state and business logic, exposing streams of data to the UI.

---

## 4. UI Pages and Components

Build the following pages and widgets.

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

### Page 1: Dashboard (`DashboardPage.dart`)
- **UI:** A `ListView` or `Column` with padding.
  - **Header:** "Dashboard" title and a subtitle.
  - **Stats Grid:** A responsive grid (`GridView` or `Wrap`) of cards displaying key statistics. Each card should contain an icon, title, value, and a short description.
    - Stats to show: Total Words, Learned Words, Overall Accuracy, Hard Words, Medium Words, Easy Words, Today's Words.
    - Cards should be tappable, navigating to the `Words List` page with the corresponding filter applied.
  - **Quick Actions Section:**
    - "Revision" Card: Navigates to the `Exam` page to start a session with 'Hard' and 'Medium' words.
    - "Words List" Card: Navigates to the `Words List` page.

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
- **UI:** A detailed view of a single word, shown when a user taps a word in the list.
  - Word, Part of Speech, Difficulty Badge.
  - Pronunciation controls (US/UK accent, speed, volume) using `flutter_tts`.
  - Bengali meaning, meaning explanation.
  - Synonyms and Antonyms displayed as tappable chips.
  - Example sentences.
  - Verb forms table (if applicable).

#### Dialogs (`AddWordDialog.dart`, `AddNoteDialog.dart`)
- Use `showDialog` to present a modal.
- Implement a `Tabbed` view for "Add Single" vs. "Bulk Import from JSON".
- Use `Form` widgets with `TextFormField` and validation for input.
- For bulk import, provide a multi-line `TextFormField` for pasting JSON data.

---

## 5. PWA & Offline Support

- **Service Worker:** While Flutter Web supports PWA, the primary focus is on mobile. For mobile, the offline-first architecture with Hive is sufficient.
- **Dependencies:**
  - `hive`, `hive_flutter`, `hive_generator`
  - A state management library (e.g., `flutter_bloc`)
  - `path_provider` (for Hive initialization)
  - `flutter_tts` (for text-to-speech)
  - `json_serializable`
  - `equatable` (for BLoC state/events)
  - `fl_chart` (for charts)

This prompt provides a complete blueprint for developing the LexiLearn app in Flutter, mirroring the functionality of the existing Next.js version. Good luck!
