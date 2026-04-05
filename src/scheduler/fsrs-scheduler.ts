import { fsrs, createEmptyCard } from 'ts-fsrs';
import type { Card, Grade, RecordLogItem } from 'ts-fsrs';
import type { FSRSData, Rating as SynapseRating } from '../types';
import { DEFAULT_FSRS_PARAMETERS } from '../settings';

export function createFSRSInstance(params = DEFAULT_FSRS_PARAMETERS) {
  return fsrs(params);
}

export function cardToFSRSData(card: Card): FSRSData {
  const nextReview = formatDate(card.due);
  return {
    nextReview,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    repetitions: card.reps,
    lapses: card.lapses,
  };
}

export function fsrsDataToCard(fsrsData: FSRSData): Card {
  const state = getStateFromRepetitions(fsrsData.repetitions, fsrsData.lapses);
  const card: Card = {
    due: new Date(fsrsData.nextReview),
    stability: fsrsData.stability,
    difficulty: fsrsData.difficulty,
    elapsed_days: fsrsData.elapsedDays,
    scheduled_days: 0,
    learning_steps: 0,
    reps: fsrsData.repetitions,
    lapses: fsrsData.lapses,
    state,
    last_review: undefined,
  };
  return card;
}

function getStateFromRepetitions(repetitions: number, lapses: number) {
  if (repetitions === 0) {
    return 0;
  }
  if (lapses > 0) {
    return 3;
  }
  return 2;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function review(
  currentFsrs: FSRSData | undefined,
  rating: SynapseRating,
  now: Date = new Date(),
): FSRSData {
  const f = createFSRSInstance();
  let card: Card;

  if (currentFsrs) {
    card = fsrsDataToCard(currentFsrs);
  } else {
    card = createEmptyCard(now);
  }

  const grade = rating as Grade;
  const result = f.next(card, now, grade);
  return cardToFSRSData(result.card);
}

export function getNextInterval(
  currentFsrs: FSRSData | undefined,
  rating: SynapseRating,
  now: Date = new Date(),
): number {
  const f = createFSRSInstance();
  let card: Card;

  if (currentFsrs) {
    card = fsrsDataToCard(currentFsrs);
  } else {
    card = createEmptyCard(now);
  }

  const grade = rating as Grade;
  const result = f.next(card, now, grade);
  return result.log.scheduled_days;
}

export function getPreviewIntervals(
  currentFsrs: FSRSData | undefined,
  now: Date = new Date(),
): Record<SynapseRating, number> {
  const f = createFSRSInstance();
  let card: Card;

  if (currentFsrs) {
    card = fsrsDataToCard(currentFsrs);
  } else {
    card = createEmptyCard(now);
  }

  const preview = f.repeat(card, now);

  return {
    1: (preview as unknown as Record<number, RecordLogItem>)[1].log.scheduled_days,
    2: (preview as unknown as Record<number, RecordLogItem>)[2].log.scheduled_days,
    3: (preview as unknown as Record<number, RecordLogItem>)[3].log.scheduled_days,
    4: (preview as unknown as Record<number, RecordLogItem>)[4].log.scheduled_days,
  };
}

export function isNewCard(fsrsData: FSRSData | undefined): boolean {
  return fsrsData === undefined || fsrsData.repetitions === 0;
}

export function isDue(fsrsData: FSRSData | undefined): boolean {
  if (isNewCard(fsrsData)) {
    return true;
  }
  if (!fsrsData) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextReview = new Date(fsrsData.nextReview);
  nextReview.setHours(0, 0, 0, 0);

  return nextReview <= today;
}

export function getRetention(
  currentFsrs: FSRSData | undefined,
  now: Date = new Date(),
): number {
  if (!currentFsrs) return 0;

  const f = createFSRSInstance();
  const card = fsrsDataToCard(currentFsrs);
  return f.get_retrievability(card, now, false);
}