export type Language = 'python' | 'java' | 'javascript' | 'react' | 'typescript' | 'cpp';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type LearningMode = 'challenge' | 'learn' | 'quiz' | 'notes' | 'stats';

export interface Challenge {
  id: string;
  language: Language;
  difficulty: Difficulty;
  title: string;
  description: string;
  starterCode: string;
  hints: string[];
  completed?: boolean;
}

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: Language;
  date: string;
}

export interface WrongNote {
  id: string;
  challenge: Challenge;
  submittedCode: string;
  review: string;
  date: string;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Settings {
  apiKey: string;
  apiProvider: 'groq' | 'openai' | 'gemini';
  selectedLanguage: Language;
  difficulty: Difficulty;
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  python: 'Python',
  java: 'Java',
  javascript: 'JavaScript',
  react: 'React',
  typescript: 'TypeScript',
  cpp: 'C++',
};

export const LANGUAGE_ICONS: Record<Language, string> = {
  python: '🐍',
  java: '☕',
  javascript: '⚡',
  react: '⚛️',
  typescript: '🔷',
  cpp: '⚙️',
};

export const MONACO_LANGUAGE_MAP: Record<Language, string> = {
  python: 'python',
  java: 'java',
  javascript: 'javascript',
  react: 'javascript',
  typescript: 'typescript',
  cpp: 'cpp',
};
