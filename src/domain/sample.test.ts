import { validateHabitInput } from "./habit";
import { sampleHabits } from "./sample";
import { currentStreak } from "./streak";

const TODAY = "2026-11-20";

describe("sistema de exemplo", () => {
  const counter = () => {
    let next = 0;
    return () => `id-${(next += 1)}`;
  };

  it("gera quatro hábitos válidos com ids únicos", () => {
    const habits = sampleHabits(TODAY, counter());
    expect(habits).toHaveLength(4);
    expect(new Set(habits.map((habit) => habit.id)).size).toBe(4);
    habits.forEach((habit) => expect(validateHabitInput(habit)).toEqual({}));
  });

  it("cria sequências variadas para mostrar planetas em níveis diferentes", () => {
    const streaks = sampleHabits(TODAY, counter()).map((habit) => currentStreak(habit.checkins, TODAY));
    expect(streaks).toEqual([16, 8, 2, 31]);
  });

  it("não cria check-ins no futuro", () => {
    const allDays = sampleHabits(TODAY, counter()).flatMap((habit) => habit.checkins);
    expect(allDays.every((day) => day <= TODAY)).toBe(true);
  });
});
