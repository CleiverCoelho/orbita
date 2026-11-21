import { addDays, type DateKey, daysBetween, startOfWeek } from "./dates";
import { type Habit, isDoneOn } from "./habit";
import { currentStreak, longestStreak } from "./streak";

export interface WeekProgress {
  done: number;
  target: number;
  met: boolean;
}

export function weekProgress(habit: Habit, today: DateKey): WeekProgress {
  const monday = startOfWeek(today);
  const done = habit.checkins.filter((day) => day >= monday && day <= today).length;
  return { done, target: habit.weeklyTarget, met: done >= habit.weeklyTarget };
}

export function completionRate(habit: Habit, today: DateKey, windowDays = 30): number {
  const windowStart = addDays(today, -(windowDays - 1));
  const start = habit.createdAt > windowStart ? habit.createdAt : windowStart;
  if (start > today) return 0;
  const totalDays = daysBetween(start, today) + 1;
  const done = habit.checkins.filter((day) => day >= start && day <= today).length;
  return Math.min(1, done / totalDays);
}

export interface Overview {
  total: number;
  doneToday: number;
  bestStreak: number;
  averageRate: number;
  energy: number;
}

export function overview(habits: Habit[], today: DateKey): Overview {
  if (habits.length === 0) {
    return { total: 0, doneToday: 0, bestStreak: 0, averageRate: 0, energy: 0 };
  }
  const doneToday = habits.filter((habit) => isDoneOn(habit, today)).length;
  const bestStreak = Math.max(...habits.map((habit) => longestStreak(habit.checkins)));
  const averageRate = habits.reduce((sum, habit) => sum + completionRate(habit, today), 0) / habits.length;
  const energy = habits.reduce((sum, habit) => sum + currentStreak(habit.checkins, today), 0) * 10 + doneToday * 5;
  return { total: habits.length, doneToday, bestStreak, averageRate, energy };
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
