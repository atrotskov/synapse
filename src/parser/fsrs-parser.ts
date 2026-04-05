import type { FSRSData } from '../types';

const FSRS_PATTERN = /\[fsrs:([^\]]+)\]/;

export function parseFSRS(line: string): FSRSData | undefined {
  const match = line.match(FSRS_PATTERN);
  if (!match) return undefined;

  const parts = match[1].split('|');
  if (parts.length !== 6) return undefined;

  const [nextReview, stability, difficulty, elapsedDays, repetitions, lapses] = parts;

  return {
    nextReview: nextReview.trim(),
    stability: parseFloat(stability),
    difficulty: parseFloat(difficulty),
    elapsedDays: parseInt(elapsedDays),
    repetitions: parseInt(repetitions),
    lapses: parseInt(lapses),
  };
}

export function serializeFSRS(fsrs: FSRSData): string {
  return `[fsrs:${fsrs.nextReview}|${fsrs.stability}|${fsrs.difficulty}|${fsrs.elapsedDays}|${fsrs.repetitions}|${fsrs.lapses}]`;
}

export function updateFSRSLine(line: string, fsrs: FSRSData): string {
  const existingMatch = line.match(FSRS_PATTERN);
  if (existingMatch) {
    return line.replace(existingMatch[0], serializeFSRS(fsrs));
  }
  return line.trimEnd() + ' ' + serializeFSRS(fsrs);
}

export function removeFSRSFromLine(line: string): string {
  return line.replace(FSRS_PATTERN, '').trimEnd();
}

export function isDueForReview(fsrs: FSRSData): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextReviewDate = new Date(fsrs.nextReview);
  nextReviewDate.setHours(0, 0, 0, 0);
  return nextReviewDate <= today;
}

export function isNewEntry(fsrs: FSRSData | undefined): boolean {
  return fsrs === undefined;
}

export function isLearning(fsrs: FSRSData): boolean {
  return fsrs.repetitions === 0 || fsrs.elapsedDays < 1;
}

export function isLearned(fsrs: FSRSData): boolean {
  return fsrs.repetitions >= 5 && fsrs.elapsedDays >= 7;
}