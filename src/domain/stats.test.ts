import type { Habit } from "./habit";
import { completionRate, formatPercent, overview, weekProgress } from "./stats";

const TODAY = "2026-11-20";

function buildHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "h1",
    name: "Correr",
    color: "#ff7a59",
    kind: "lava",
    weeklyTarget: 3,
    createdAt: "2026-10-01",
    checkins: [],
    ...overrides,
  };
}

describe("progresso semanal", () => {
  it("conta apenas os check-ins desde a segunda-feira da semana atual", () => {
    const habit = buildHabit({ checkins: ["2026-11-15", "2026-11-16", "2026-11-18"] });
    expect(weekProgress(habit, TODAY)).toEqual({ done: 2, target: 3, met: false });
  });

  it("indica quando a meta da semana foi atingida", () => {
    const habit = buildHabit({ checkins: ["2026-11-16", "2026-11-17", "2026-11-19"] });
    expect(weekProgress(habit, TODAY).met).toBe(true);
  });
});

describe("taxa de conclusão", () => {
  it("divide os dias feitos pelos dias da janela", () => {
    const habit = buildHabit({ checkins: ["2026-11-19", TODAY] });
    expect(completionRate(habit, TODAY, 4)).toBe(0.5);
  });

  it("começa a contar a partir da criação de hábitos recentes", () => {
    const habit = buildHabit({ createdAt: "2026-11-19", checkins: [TODAY] });
    expect(completionRate(habit, TODAY)).toBe(0.5);
  });

  it("é zero para um hábito criado no futuro", () => {
    expect(completionRate(buildHabit({ createdAt: "2026-12-01" }), TODAY)).toBe(0);
  });
});

describe("visão geral do sistema", () => {
  it("devolve zeros quando ainda não há hábitos", () => {
    expect(overview([], TODAY)).toEqual({ total: 0, doneToday: 0, bestStreak: 0, averageRate: 0, energy: 0 });
  });

  it("resume hábitos feitos hoje, melhor sequência e energia acumulada", () => {
    const habits = [
      buildHabit({ id: "a", createdAt: "2026-11-19", checkins: ["2026-11-19", TODAY] }),
      buildHabit({ id: "b", createdAt: "2026-11-19", checkins: [] }),
    ];
    expect(overview(habits, TODAY)).toEqual({
      total: 2,
      doneToday: 1,
      bestStreak: 2,
      averageRate: 0.5,
      energy: 25,
    });
  });

  it("formata frações como porcentagens inteiras", () => {
    expect(formatPercent(0.666)).toBe("67%");
  });
});
