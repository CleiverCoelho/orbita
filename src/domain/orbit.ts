import type { DateKey } from "./dates";
import type { Habit } from "./habit";
import { completionRate } from "./stats";
import { currentStreak, longestStreak } from "./streak";

export interface Orbit {
  radius: number;
  size: number;
  speed: number;
  phase: number;
  tilt: number;
  glow: number;
  rings: boolean;
  moons: number;
}

export const FIRST_ORBIT = 3.4;
export const ORBIT_GAP = 1.7;
const MIN_SIZE = 0.32;
const SIZE_RANGE = 0.58;
const STREAK_CAP = 30;

export function hashToUnit(text: string): number {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export function orbitFor(habit: Habit, index: number, today: DateKey): Orbit {
  const streak = currentStreak(habit.checkins, today);
  const radius = FIRST_ORBIT + index * ORBIT_GAP;
  const seed = hashToUnit(habit.id);
  return {
    radius,
    size: MIN_SIZE + (Math.min(streak, STREAK_CAP) / STREAK_CAP) * SIZE_RANGE,
    speed: 0.6 / Math.sqrt(radius),
    phase: seed * Math.PI * 2,
    tilt: (seed - 0.5) * 0.35,
    glow: completionRate(habit, today),
    rings: habit.kind === "gasoso" || streak >= 14,
    moons: Math.min(3, Math.floor(longestStreak(habit.checkins) / 7)),
  };
}
