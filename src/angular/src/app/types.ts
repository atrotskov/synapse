// ⚠️ DUPLICATE: This file is mirrored in src/types.ts
// Changes must be kept in sync. This version is for Angular components only.

export interface Translation {
  lang: string;
  meanings: string[];
}

export interface ExampleSegment {
  lang: string;
  text: string;
}

export interface Example {
  segments: ExampleSegment[];
}

export interface Forms {
  lang: string;
  text: string;
}

export interface Note {
  lang: string;
  text: string;
}

export interface Pronunciation {
  lang: string;
  text: string;
}

export interface FSRSData {
  nextReview: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  repetitions: number;
  lapses: number;
}

export interface VocabularyEntry {
  translations: Translation[];
  tags: string[];
  examples: Example[];
  forms: Forms[];
  notes: Note[];
  pronunciations: Pronunciation[];
  fsrs?: FSRSData;
  rawLine: string;
  lineIndex: number;
}

export interface SynapseSettings {
  vocabularyFile: string;
  primaryLanguage: string;
  dailyReviewLimit: number;
  matchingGameSize: number;
  tagsToExclude: string;
}

export type Rating = 1 | 2 | 3 | 4;

export const RATING_LABELS: Record<Rating, string> = {
  1: 'Again',
  2: 'Hard',
  3: 'Good',
  4: 'Easy',
};

export interface ReviewResult {
  entry: VocabularyEntry;
  rating: Rating;
  reviewedAt: Date;
}

export interface MatchingPair {
  source: VocabularyEntry;
  target: VocabularyEntry;
  sourceLang: string;
  targetLang: string;
}

export interface GameResult {
  totalPairs: number;
  correctPairs: number;
  timeSpentSeconds: number;
  mistakes: MatchingPair[];
}

export interface Statistics {
  totalWords: number;
  learnedWords: number;
  learningWords: number;
  newWords: number;
  reviewStreak: number;
  accuracyPerTag: Record<string, number>;
  accuracyPerLanguagePair: Record<string, number>;
  totalTimeSpentMinutes: number;
  retentionRate: number;
}
