# Comprehensive Blueprint for Building the "WordPro" Application

## 1. App Overview & Core Concept

This document outlines the complete blueprint for building "WordPro," a modern, offline-first vocabulary learning application. The primary goal is to help users build, manage, and revise their vocabulary with meanings in their native language (e.g., English to Bengali). The app must be clean, intuitive, and highly functional, ensuring a seamless user experience on any platform (iOS, Android, Web).

**Core Principles (Mandatory):**
- **Offline-First:** The app must be 100% functional without an internet connection. All user data (words, notes, progress) must be stored locally on the device.
- **Local Data Persistence:** Use a robust local database solution (e.g., SQLite, Realm, IndexedDB) to store structured data like words and notes.
- **State Management:** Implement a clear and scalable state management architecture to handle the application's state, separating UI from business logic.
- **UI/UX:** The user interface must be clean, modern, and responsive. It should adhere to modern design principles and feel intuitive to the user.
- **Theming:** The app must support both **Light and Dark themes** that can be switched by the user or follow system settings.
- **Responsive Design:** The UI must adapt gracefully to different screen sizes, from small phones to large tablets, without breaking the layout or requiring horizontal scrolling (except for specific elements like data tables).

---

## 2. Data Models

Define the following data structures to represent the application's data. These models should be easily convertible to and from the format required by the local database (e.g., via `toMap`/`fromMap` or serialization).

### Word Model
A detailed structure for a single vocabulary word.

- `id` (String): A unique identifier, typically the lowercase version of the word itself.
- `word` (String): The vocabulary word in English.
- `meaning` (String): The primary meaning of the word in the target language (e.g., Bengali).
- `partsOfSpeech` (String): The grammatical part of speech (e.g., "Noun", "Verb", "Adjective").
- `difficultyLevel` (String): The user's perceived difficulty ('New', 'Hard', 'Medium', 'Easy').
- `isLearned` (Boolean): A flag indicating if the user has mastered the word.
- `timesCorrect` (Integer): Counter for correct answers in tests.
- `timesIncorrect` (Integer): Counter for incorrect answers.
- `lastReviewed` (DateTime/Timestamp): The timestamp of the last time the word was included in a test.
- `createdAt` (DateTime/Timestamp): The timestamp when the word was added.
- `meaningExplanation` (String, Optional): A more detailed explanation of the meaning.
- `usageDistinction` (String, Optional): Explanation of subtle differences between similar words (e.g., "do" vs. "make").
- `syllables` (List of Strings, Optional): The word broken down into syllables (e.g., `["vo", "cab", "u", "la", "ry"]`).
- `synonyms` (List of `SynonymAntonym` objects, Optional): A list of synonyms.
- `antonyms` (List of `SynonymAntonym` objects, Optional): A list of antonyms.
- `exampleSentences` (List of Strings, Optional): Sentences demonstrating the word's usage.
- `verbForms` (`VerbForms` object, Optional): Detailed verb conjugations, if the word is a verb.
- `spellingError` (Integer): Counter for spelling-related errors.
- `meaningError` (Integer): Counter for meaning-related errors.

### Supporting Data Models for `Word`

- **`SynonymAntonym` Object:**
  - `word` (String): The synonym or antonym.
  - `meaning` (String): The meaning of that synonym/antonym.

- **`VerbForms` Object:**
  - `v1Present` (`VerbFormDetail`): Present form (V1).
  - `v2Past` (`VerbFormDetail`): Past form (V2).
  - `v3PastParticiple` (`VerbFormDetail`): Past participle form (V3).
  - `formExamples` (`FormExamples`): Example sentences for each verb form.

- **`VerbFormDetail` Object:**
  - `word` (String): The verb form itself (e.g., "go", "went", "gone").
  - `pronunciation` (String): How to pronounce the form.
  - `banglaMeaning` (String): Meaning of the form in the target language.
  - `usageTiming` (String): When to use this form (e.g., "Used for past actions").

- **`FormExamples` Object:**
  - `v1` (String): Example sentence using the V1 form.
  - `v2` (String): Example sentence using the V2 form.
  - `v3` (String): Example sentence using the V3 form.

### Note Model
A simple structure for user-created notes.

- `id` (String): A unique identifier, generated from the title (e.g., lowercase with dashes).
- `title` (String): The title of the note.
- `content` (String): The body/content of the note.
- `createdAt` (DateTime/Timestamp): The timestamp when the note was created.

---

## 3. Core Logic & Data Management (Data Layer)

Implement a robust data layer to abstract database interactions from the business logic.

### Database Manager
- **Responsibility:** Manage the lifecycle of the local database connection. This should be implemented as a singleton to ensure only one database connection is active at a time.
- **Tasks:**
  - Initialize the database on first launch.
  - Execute schema creation queries to create the `words` and `notes` tables if they don't exist.
  - Provide a globally accessible instance of the database connection.

### Data Repositories
Create repository classes that act as the sole interface to the database for specific data models. This isolates all data-related code.

- **`VocabularyRepository`:**
  - **Responsibility:** Handle all CRUD (Create, Read, Update, Delete) operations for the `words` table.
  - **Methods:**
    - `getAllWords()`: Fetch all words, ordered alphabetically.
    - `addWord(word)`: Add a single new word. Must prevent duplicates based on `id`.
    - `updateWord(id, updates)`: Update specific fields of an existing word.
    - `deleteWord(id)`: Remove a word from the database.
    - `addMultipleWords(words)`: Bulk-insert a list of words. This operation must be transactional to ensure data integrity and performance. It should return a summary of how many words were added and how many were skipped as duplicates.

- **`NotesRepository`:**
  - **Responsibility:** Handle all CRUD operations for the `notes` table.
  - **Methods:**
    - `getAllNotes()`: Fetch all notes, sorted by creation date (newest first).
    - `addNote(note)`: Add a new note.
    - `updateNote(id, updates)`: Update an existing note.
    - `deleteNote(id)`: Remove a note.

### State Management
- **Responsibility:** Manage the application's runtime state and expose it to the UI. This layer uses the repositories to fetch and persist data.
- **Logic:**
  - Maintain the in-memory state of the app (e.g., the list of all words, loading status, current user statistics).
  - Provide public methods that the UI can call to trigger actions (e.g., `addNewWord`, `fetchWords`).
  - When data is modified (e.g., a word is added), it should:
    1. Call the appropriate repository method to update the database.
    2. Re-fetch the data from the repository to update the in-memory state.
    3. Notify all listening UI components that the state has changed, so they can rebuild themselves.

---

## 4. UI Screens and Components

Build the following screens and reusable components. The UI should react to state changes from the state management layer.

### Main Layout
- A primary screen that hosts a bottom navigation bar.
- **Navigation Items:**
  1. **Dashboard** (Icon: e.g., `dashboard`)
  2. **Words List** (Icon: e.g., `list`)
  3. **Exam** (Icon: e.g., `school` or `quiz`)
  4. **Performance** (Icon: e.g., `bar_chart`)
  5. **Notes** (Icon: e.g., `note`)
- A top app bar with the app title "WordPro" and action buttons for adding a new word and a new note.

### Screen 1: Dashboard
- **UI:** A scrollable view displaying key metrics and quick actions.
  - **Header:** "Dashboard" title with a descriptive subtitle.
  - **Stats Grid:** A responsive grid of cards showing key statistics:
    - Total Words, Learned Words, Overall Accuracy, Hard Words, Medium Words, Easy Words, Words Added Today.
    - Each card should be tappable and navigate to the "Words List" screen with the corresponding filter applied.
  - **Quick Actions Section:**
    - A "Revision" card with a "Start Revision" button that navigates to the "Exam" screen (filtered for 'Hard' and 'Medium' words).
    - A "Words List" card with a "View List" button that navigates to the "Words List" screen.

### Screen 2: Words List
- **UI:** A screen to display, search, and filter the vocabulary.
  - **Header:** Screen title, a search input field, and a filter button.
  - **Search:** Filter the list in real-time as the user types.
  - **Filter:** A dropdown menu to filter words by Part of Speech.
  - **Exam Button:** If any filter is active, a button should appear to start an exam with the filtered set of words.
  - **Word List:** A virtualized list of `WordListItem` components to ensure smooth scrolling with large vocabularies.
  - **`WordListItem` Component:**
    - Display the word, its meaning, and part of speech.
    - A visual indicator (e.g., a colored badge) for the difficulty level.
    - A context menu (e.g., on long-press or a "more" icon) with "Edit" and "Delete" options.
    - Tapping the item should navigate to the `WordDetails` screen.

### Screen 3: Exam
- **UI:** The core learning interface.
  - **Filter Controls:** Dropdowns to filter words by difficulty and to select a specific exam type.
  - **Learning Client:** A stateful component that manages the exam session.
    - **Logic:**
      1. Fetch a word based on selected filters and the smart revision algorithm (prioritize 'Hard'/'Medium' and least-recently-reviewed words).
      2. Render the appropriate test component based on the exam type. If the type is "Dynamic," randomly select a suitable test for the word.
      3. After the user submits an answer, display a `FeedbackScreen`.
      4. After feedback, load the next word.
      5. If no more words are available for the selected filter, show a "Session Complete" message.
- **Test Components:**
  - **MCQ Test:** A question with 4 tappable options.
  - **Spelling Test:** An input field where the user can type the word after hearing it (Text-to-Speech) or seeing its meaning.
  - **Verb Form Test:** Two input fields for V2 and V3 forms.
  - **Fill in the Blanks:** A sentence with the target word blanked out.
- **`FeedbackScreen` Component:**
  - Clearly indicate if the answer was "Correct" or "Incorrect."
  - Display the correct answer, its meaning, and an example sentence.
  - A "Next Word" button to continue the session.

### Screen 4: Performance
- **UI:** A dashboard with charts and data visualizations.
  - **Error Distribution Chart:** A pie chart showing the breakdown of `spelling_error` vs. `meaning_error`.
  - **Hardest Words List:** A list of the top 3-5 words with the highest number of incorrect answers. Each item should be tappable and navigate to the `WordDetails` screen.
  - **(Advanced) 7-Day Progress Chart:** A line chart showing the trend of errors over the last 7 days. This requires storing historical stats.

### Screen 5: Notes
- **UI:** A screen displaying a grid of user notes.
  - **Search Bar:** To filter notes by title or content.
  - **Notes Grid:** A responsive grid of `NoteCard` components.
  - **`NoteCard` Component:** Display the note's title and a snippet of its content. Tapping opens the `NoteDetails` screen.
  - **Add Note Button:** A floating action button to open the "Add Note" dialog.

### Other Important UI Components:

#### Word Details Screen
- **UI:** A scrollable screen showing all available details for a single word.
  - **Header:** The word in a large font, its part of speech, and controls for text-to-speech pronunciation. A badge should display the difficulty level.
  - **Pronunciation Control:** A pop-up to control accent (US/UK), speed, and volume.
  - **Content Sections:** Clearly separated sections for:
    - Meaning (in the target language).
    - Meaning Explanation (if available).
    - Usage Distinction (if available).
    - Syllables.
    - Synonyms and Antonyms (displayed as tappable chips).
    - Example Sentences.
    - Verb Forms (displayed in a clear table, only if it's a verb).
  - **Next/Previous Buttons:** Buttons at the bottom to navigate to the next or previous word in the current filtered list.

#### Dialogs for Adding Content
- **Add Word Dialog:**
  - Must have a tabbed interface for "Add Single" vs. "Bulk Import from JSON".
  - **Add Single Tab:** A form with input fields for all word properties.
  - **Bulk Import Tab:** A large text area for pasting JSON data.
    - **Example JSON Placeholder:** `[{"word": "active", "meaning": "সক্রিয়", ...}, {"word": "do", "meaning": "করা", ...}]`
    - The import logic must parse the JSON, validate the data, and use the transactional `addMultipleWords` repository method.
    - After import, show a summary message (e.g., "5 words added, 2 duplicates skipped.").
- **Add Note Dialog:**
  - A simpler dialog with a form for the title and content.
  - It should also support bulk JSON import via a tab.
  - **Example JSON Placeholder:** `[{"title": "My Note", "content": "Details here..."}, ...]`

---

This blueprint provides a complete and platform-agnostic guide for developing the WordPro application. By following these architectural and functional requirements, any developer should be able to build a consistent and high-quality app.