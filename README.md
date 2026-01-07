# WordPro - Vocabulary Builder

WordPro is a modern, offline-first vocabulary learning application designed to help users build and revise their vocabulary effectively. Built with Next.js and leveraging local storage, it offers a seamless and fast user experience without requiring a constant internet connection.

## ✨ Features

- **Offline-First:** All vocabulary data is stored in your browser's local storage, allowing you to use the app anytime, anywhere.
- **Dynamic Learning Sessions:** Engage in various quiz types, including MCQs, spelling tests, fill-in-the-blanks, and more.
- **Smart Revision:** The app prioritizes words you find difficult ('Hard' and 'Medium' levels) to ensure effective revision.
- **Detailed Word View:** Explore word meanings, parts of speech, synonyms, antonyms, example sentences, and verb forms.
* **Add & Manage Words:** Easily add new words individually or in bulk via JSON import. Edit or delete existing words.
- **Statistics Dashboard:** Track your progress with detailed stats on total words, learned words, and overall accuracy.
- **PWA Ready:** Install the app on your mobile device for a native-app-like experience.
- **Responsive Design:** A clean, modern, and responsive UI that works beautifully on all devices.

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
   git clone https://github.com/your-username/WordPro09672.git
   cd WordPro09672
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
Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. The app will automatically reload if you make any changes to the code.

## 🏗️ Building for Production

To create a production-ready static build of the app, run:
```bash
npm run build
```
This command will generate a static version of your site in the `./out` directory. These files are optimized and ready to be deployed to any static hosting service.

## 📁 Project Structure

```
.
├── public/                # Static assets (icons, manifest.json)
├── src/
│   ├── app/               # Next.js App Router pages and layouts
│   ├── components/        # Reusable React components (UI, layout, etc.)
│   ├── hooks/             # Custom React hooks (e.g., use-vocabulary)
│   ├── lib/               # Utility functions and data
│   └── types/             # TypeScript type definitions
├── next.config.mjs        # Next.js configuration
├── package.json           # Project dependencies and scripts
└── tailwind.config.ts     # Tailwind CSS configuration
```

Thank you for checking out WordPro!
