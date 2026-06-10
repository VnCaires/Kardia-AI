import { Card, DifficultyLevel } from "../types";

/**
 * SuperMemo SM-2 algorithm calculation for spaced repetition.
 * @param quality 0 (Errei), 1 (Difícil), 2 (Bom), 3 (Fácil)
 * @param currentRepetition current consecutive correct repetitions
 * @param currentInterval current interval in days
 * @param currentEaseFactor current ease factor (starting around 2.5)
 */
export function calculateSM2(
  quality: number,
  currentRepetition: number,
  currentInterval: number,
  currentEaseFactor: number
) {
  let repetition = currentRepetition;
  let interval = currentInterval;
  let easeFactor = currentEaseFactor;

  if (quality >= 2) {
    // Correct choices (Bom or Fácil)
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 4;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition = repetition + 1;
  } else {
    // Incorrect / challenging (Errei or Difícil)
    repetition = 0;
    interval = 1;
  }

  // Adjust EF based on quality rating
  // Formula: EF' = EF + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02))
  easeFactor = easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    repetition,
    interval,
    easeFactor,
    nextReviewDate: nextDate.toISOString(),
  };
}

export function getDifficultyLabel(level: DifficultyLevel): string {
  switch (level) {
    case "easy":
      return "Fácil";
    case "medium":
      return "Médio";
    case "hard":
      return "Difícil";
  }
}
