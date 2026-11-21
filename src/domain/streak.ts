import { addDays, type DateKey, daysBetween } from "./dates";

export function currentStreak(checkins: DateKey[], today: DateKey): number {
  const done = new Set(checkins);
  let cursor = done.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (done.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(checkins: DateKey[]): number {
  const days = [...new Set(checkins)].sort();
  let longest = 0;
  let running = 0;
  days.forEach((day, index) => {
    running = index > 0 && daysBetween(days[index - 1], day) === 1 ? running + 1 : 1;
    longest = Math.max(longest, running);
  });
  return longest;
}

export interface Level {
  name: string;
  min: number;
  next: number | null;
}

export const LEVELS: Level[] = [
  { name: "Poeira cósmica", min: 0, next: 1 },
  { name: "Asteroide", min: 1, next: 3 },
  { name: "Lua", min: 3, next: 7 },
  { name: "Planeta", min: 7, next: 14 },
  { name: "Gigante gasoso", min: 14, next: 30 },
  { name: "Estrela", min: 30, next: null },
];

export function levelFor(streak: number): Level {
  return [...LEVELS].reverse().find((level) => streak >= level.min) ?? LEVELS[0];
}

export function levelProgress(streak: number): number {
  const level = levelFor(streak);
  if (level.next === null) return 1;
  return (streak - level.min) / (level.next - level.min);
}
