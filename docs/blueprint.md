# **App Name**: LexiLearn

## Core Features:

- Local Word Storage: Stores vocabulary data using SQLite for offline access.
- Bulk JSON Import: Imports vocabulary data from a JSON file (3000+ words) containing word, syllables, meaning, accent (UK/US), difficulty, and learned status. Add new words manually.
- Spaced Repetition Learning: Implements a smart learning algorithm that categorizes words into Easy, Medium, and Hard, adapting repetition frequency based on user performance.
- Adaptive Learning Tool: The tool categorizes incorrectly answered words to 'Hard' section and repeats them more frequently. Also provide multiple choice question to select equivalent meanings from one language to the other, when configured to do so.
- Offline Pronunciation: Integrates TTS for offline speech of words. Allow toggling between UK and US accents.
- Syllable-Based Spelling Test: Speaks a word for the user to type. If the spelling is wrong, show the word broken into syllables to indicate errors.
- Daily Revision Cycle: Prompts the user to revise 'Hard' and 'Medium' words before introducing new ones daily.

## Style Guidelines:

- Primary color: Dark blue (#2C3E50) to match a sophisticated, serious tone appropriate for education.
- Background color: Very dark grey (#34495E).
- Accent color: Cyan (#4ECDC4) to highlight important interactive elements like buttons.
- Body and headline font: 'Inter', sans-serif, for a clean, modern, and easily readable style.
- Code font: 'Source Code Pro' for any technical content
- Use a 'Learning Card' view for vocabulary display, with support for tap-to-flip or swipe-to-reveal meanings.
- Implement a dashboard displaying daily stats such as words mastered and accuracy rate.