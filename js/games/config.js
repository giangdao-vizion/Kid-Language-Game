/** Shared game config (scoring, limits). */

export const MEMORY_CONFIG = {
  difficulties: {
    easy: { cols: 4, rows: 3, timeSec: 90, label: "Dễ · 4×3" },
    medium: { cols: 4, rows: 4, timeSec: 100, label: "Trung bình · 4×4" },
    hard: { cols: 5, rows: 4, timeSec: 120, label: "Khó · 5×4" },
  },
  pairPoints: 100,
  wrongPenalty: 8,
  timeBonus: 2,
  flipBackMs: 1000,
};

export const QUIZ_CONFIG = {
  questionCount: 10,
  timePerQuestion: 20, // seconds (within 15–30)
  comboMultipliers: [
    { streak: 1, mult: 1 },
    { streak: 2, mult: 2 },
    { streak: 4, mult: 3 },
    { streak: 6, mult: 5 },
  ],
  basePoints: 100,
  lifelines: {
    fiftyFifty: 1,
    extraTime: 1,
    skip: 1,
  },
  extraTimeSec: 10,
  excellentAccuracy: 0.8,
};

export const POINTS_KEY = "tiny-ears-points";

export function getPoints() {
  return Number(localStorage.getItem(POINTS_KEY) || 0) || 0;
}

export function addPoints(delta) {
  const next = Math.max(0, getPoints() + (Number(delta) || 0));
  localStorage.setItem(POINTS_KEY, String(next));
  return next;
}

export function quizMultiplier(streak) {
  let mult = 1;
  for (const row of QUIZ_CONFIG.comboMultipliers) {
    if (streak >= row.streak) mult = row.mult;
  }
  return mult;
}
