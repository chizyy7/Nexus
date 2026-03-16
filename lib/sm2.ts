export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

export interface SM2State {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface SM2Result extends SM2State {
  nextReviewAt: Date;
}

export function calculateSM2(state: SM2State, rating: Rating): SM2Result {
  let { easeFactor, interval, repetitions } = state;

  if (rating < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    const efDelta = 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02);
    easeFactor = Math.max(1.3, easeFactor + efDelta);

    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }

    repetitions += 1;
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewAt,
  };
}
