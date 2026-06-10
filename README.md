# Audiobook TTS Generator (Client)

This is the frontend application for the **Audiobook TTS Generator**. It provides a rich, modern, and highly interactive user interface to manage audiobook projects, characters, scenes, and to orchestrate multi-speaker TTS (Text-to-Speech) generation using the Gemini API.

## 🚀 Features

- **Project Management**: Create and organize audiobook projects.
- **Voice Casting (Characters)**: Define characters with unique vocal traits, including gender, age, base voice style (e.g., raspy, soft-spoken), and language accents.
- **Voice Auditioning**: Generate and listen to short voice samples for your characters directly in the browser.
- **Scene Editor**: A sophisticated editor for writing and importing dialogue. Each line can be assigned to a specific character with line-specific emotional prompts (e.g., *whispering*, *shouting*, *hesitant*).
- **Phonetic Dictionary (WIP)**: A tool to enforce correct pronunciation and stress marks for specific words across all your projects.

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: [React](https://reactjs.org/)
- **Styling & Components**: [Material UI (MUI v5)](https://mui.com/)
- **Data Fetching & State**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- `pnpm` package manager

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run the development server:
   ```bash
   pnpm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

> **Note:** The frontend expects the backend server to be running locally on `http://localhost:8000`.

## 📜 License

This project is licensed under the **MIT License**. You are free to use, modify, and distribute it for both personal and commercial purposes. 

*Please note that this application relies on third-party services and models (such as the Google Gemini API) which are subject to their own respective terms of service.*
