import { Injectable } from '@angular/core';
import { fsrs, createEmptyCard } from 'ts-fsrs';
import type { Card, Grade, RecordLogItem, FSRSParameters } from 'ts-fsrs';
import type { FSRSData, Rating } from '../types';

const DEFAULT_FSRS_PARAMETERS: FSRSParameters = {
  request_retention: 0.9,
  maximum_interval: 36500,
  w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.62, 1.06, 0.26, 2.05],
  enable_fuzz: true,
  enable_short_term: true,
  learning_steps: ['1m', '10m'],
  relearning_steps: ['1m', '10m'],
};

@Injectable({ providedIn: 'root' })
export class SchedulerService {
  private createFSRSInstance(params = DEFAULT_FSRS_PARAMETERS) {
    return fsrs(params);
  }

  private cardToFSRSData(card: Card): FSRSData {
    return {
      nextReview: this.formatDate(card.due),
      stability: card.stability,
      difficulty: card.difficulty,
      elapsedDays: card.elapsed_days,
      repetitions: card.reps,
      lapses: card.lapses,
    };
  }

  private fsrsDataToCard(fsrsData: FSRSData): Card {
    const state = this.getStateFromRepetitions(fsrsData.repetitions, fsrsData.lapses);
    return {
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
  }

  private getStateFromRepetitions(repetitions: number, lapses: number): number {
    if (repetitions === 0) return 0;
    if (lapses > 0) return 3;
    return 2;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  review(currentFsrs: FSRSData | undefined, rating: Rating, now: Date = new Date()): FSRSData {
    const f = this.createFSRSInstance();
    let card: Card;

    if (currentFsrs) {
      card = this.fsrsDataToCard(currentFsrs);
    } else {
      card = createEmptyCard(now);
    }

    const grade = rating as Grade;
    const result = f.next(card, now, grade);
    return this.cardToFSRSData(result.card);
  }

  getPreviewIntervals(
    currentFsrs: FSRSData | undefined,
    now: Date = new Date(),
  ): Record<Rating, number> {
    const f = this.createFSRSInstance();
    let card: Card;

    if (currentFsrs) {
      card = this.fsrsDataToCard(currentFsrs);
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

  isDue(fsrsData: FSRSData | undefined): boolean {
    if (!fsrsData || fsrsData.repetitions === 0) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextReview = new Date(fsrsData.nextReview);
    nextReview.setHours(0, 0, 0, 0);

    return nextReview <= today;
  }

  isNew(fsrsData: FSRSData | undefined): boolean {
    return fsrsData === undefined || fsrsData.repetitions === 0;
  }
}
