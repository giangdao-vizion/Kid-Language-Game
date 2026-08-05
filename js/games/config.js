/** Shared game config (scoring, wheel drop rates, limits). */

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

/**
 * Wheel segments — weight controls relative drop rate.
 * Rewards: points | spins | badge message
 */
export const WHEEL_CONFIG = {
  dailySpins: 5,
  spinCostPoints: 50,
  storageKey: "tiny-ears-wheel",
  segments: [
    { id: "pts50", label: "+50", color: "#42A5F5", weight: 22, reward: 50 },
    { id: "pts100", label: "+100", color: "#3ECF8E", weight: 18, reward: 100 },
    { id: "pts20", label: "+20", color: "#FFC857", weight: 20, reward: 20 },
    { id: "spin1", label: "+1 lượt", color: "#AB47BC", weight: 10, spins: 1 },
    { id: "pts200", label: "+200", color: "#FF6B4A", weight: 8, points: 200 },
    { id: "miss", label: "Chúc may mắn", color: "#90A4AE", weight: 12, points: 0 },
    { id: "pts80", label: "+80", color: "#26C6DA", weight: 14, points: 80 },
    { id: "jackpot", label: "JACKPOT", color: "#EF5350", weight: 3, points: 500 },
    { id: "badge", label: "Ngôi sao!", color: "#FF8A65", weight: 8, badge: "⭐ Ngôi sao Tiny Ears" },
    { id: "pts30", label: "+30", color: "#66BB6A", weight: 15, points: 30 },
  ],
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

export function pickWeighted(segments) {
  const total = segments.reduce((s, seg) => s + seg.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < segments.length; i += 1) {
    r -= segments[i].weight;
    if (r <= 0) return i;
  }
  return segments.length - 1;
}
