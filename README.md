# WordPro - Vocabulary Builder

WordPro is a modern, offline-first vocabulary learning application designed to help users build and revise their vocabulary effectively. Built with Next.js, it's a Progressive Web App (PWA) that offers a seamless and fast user experience without requiring a constant internet connection.

## ✨ Core Features & Principles

- **Offline-First:** All vocabulary data is stored in your browser's local storage, allowing you to use the app anytime, anywhere.
- **PWA Ready:** Install the app on your mobile or desktop device for a native-app-like experience, including offline access and performance benefits.
- **Light & Dark Mode:** The app includes both light and dark themes to suit user preference.
- **Responsive Design:** A clean, modern, and responsive UI that works beautifully on all devices, from small mobile screens to large desktop monitors.

## 🔑 Key Functionalities

- **Dynamic Learning Sessions:** Engage in various quiz types to keep learning interesting, including:
  - MCQ (English to Bengali & Bengali to English)
  - Spelling Tests (from meaning or audio)
  - Fill-in-the-Blanks (complete a word or a sentence)
  - Verb Form Tests (provide V2 and V3 forms)
- **Smart Revision:** The app prioritizes words you find difficult ('Hard' and 'Medium' levels) to ensure effective revision before introducing new words.
- **Detailed Word View:** Explore comprehensive details for each word:
  - Meaning & In-depth Explanation
  - Part of Speech & Syllables
  - Usage Distinction (comparing similar words)
  - Synonyms & Antonyms
  - Example Sentences
  - Verb Forms (for verbs)
- **Add & Manage Words:** Easily add new words individually through a form or in bulk via JSON import. Edit or delete existing words at any time.
- **Statistics Dashboard:** Track your learning progress with detailed stats on total words, learned words, accuracy, and error types (spelling vs. meaning).
- **Notes:** A simple note-taking feature to jot down grammar rules or other language-related thoughts.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN/UI](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) (with `persist` middleware for local storage)
- **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/WordPro.git
   cd WordPro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running the Development Server

To start the app in development mode, run:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The app will automatically reload if you make any changes to the code.

## 🏗️ Building for Production

To create a production-ready build of the app, run:
```bash
npm run build
```
This command will generate an optimized version of your app in the `.next` directory, ready to be deployed.

## 📁 Project Structure

```
.
├── public/                # Static assets (icons, manifest.webmanifest)
├── src/
│   ├── app/               # Next.js App Router pages and layouts
│   ├── components/        # Reusable React components (UI, layout, etc.)
│   ├── hooks/             # Custom React hooks (e.g., use-vocabulary, use-notes)
│   ├── lib/               # Utility functions and data
│   └── types/             # TypeScript type definitions
├── package.json           # Project dependencies and scripts
└── tailwind.config.ts     # Tailwind CSS configuration
```

Thank you for checking out WordPro!
