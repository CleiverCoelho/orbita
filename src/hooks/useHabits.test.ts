import { act, renderHook } from "@testing-library/react";
import type { Habit } from "../domain/habit";
import { type HabitRepository, serialize } from "../domain/storage";
import { useHabits } from "./useHabits";

const TODAY = "2026-11-20";

function buildHabit(id: string, name: string): Habit {
  return { id, name, color: "#ffc857", kind: "rochoso", weeklyTarget: 3, createdAt: TODAY, checkins: [] };
}

function memoryRepository(initial: Habit[] = []) {
  const saved: Habit[][] = [];
  const repository: HabitRepository = {
    load: () => initial,
    save: (habits) => {
      saved.push(habits);
    },
  };
  return { repository, saved };
}

function setup(initial: Habit[] = []) {
  const { repository, saved } = memoryRepository(initial);
  const hook = renderHook(() => useHabits(repository, TODAY));
  return { ...hook, saved };
}

describe("hook useHabits", () => {
  it("carrega os hábitos do repositório e começa sem seleção", () => {
    const { result, saved } = setup([buildHabit("a", "Ler")]);
    expect(result.current.habits.map((habit) => habit.name)).toEqual(["Ler"]);
    expect(result.current.selected).toBeNull();
    expect(saved.at(-1)).toEqual(result.current.habits);
  });

  it("adiciona um hábito válido, seleciona-o e salva no repositório", () => {
    const { result, saved } = setup();
    let outcome!: ReturnType<typeof result.current.add>;
    act(() => {
      outcome = result.current.add({ name: "  Meditar  ", color: "#8B7DFF", kind: "gasoso", weeklyTarget: 7 });
    });

    expect(outcome.ok).toBe(true);
    expect(result.current.habits).toHaveLength(1);
    expect(result.current.habits[0]).toMatchObject({ name: "Meditar", color: "#8b7dff", createdAt: TODAY });
    expect(result.current.selected?.name).toBe("Meditar");
    expect(saved.at(-1)).toEqual(result.current.habits);
  });

  it("recusa um nome repetido sem alterar a lista", () => {
    const { result } = setup([buildHabit("a", "Ler")]);
    let outcome!: ReturnType<typeof result.current.add>;
    act(() => {
      outcome = result.current.add({ name: "ler", color: "#ffc857", kind: "rochoso", weeklyTarget: 3 });
    });

    expect(outcome).toEqual({ ok: false, errors: { name: "Já existe um planeta com esse nome." } });
    expect(result.current.habits).toHaveLength(1);
  });

  it("marca check-in, renomeia, seleciona e remove hábitos", () => {
    const { result } = setup([buildHabit("a", "Ler"), buildHabit("b", "Correr")]);

    act(() => result.current.toggle("b", TODAY));
    expect(result.current.habits[1].checkins).toEqual([TODAY]);

    act(() => result.current.rename("a", "Ler livros"));
    expect(result.current.habits[0].name).toBe("Ler livros");

    act(() => result.current.select("b"));
    expect(result.current.selected?.id).toBe("b");

    act(() => result.current.remove("b"));
    expect(result.current.habits.map((habit) => habit.id)).toEqual(["a"]);
    expect(result.current.selected).toBeNull();
  });

  it("substitui a lista pelos planetas de exemplo", () => {
    const { result } = setup([buildHabit("a", "Ler")]);
    act(() => result.current.loadSample());

    expect(result.current.habits.length).toBeGreaterThan(1);
    expect(result.current.habits.some((habit) => habit.id === "a")).toBe(false);
    expect(new Set(result.current.habits.map((habit) => habit.id)).size).toBe(result.current.habits.length);
  });

  it("exporta e importa um backup", () => {
    const { result } = setup([buildHabit("a", "Ler")]);
    const backup = result.current.exportBackup();
    expect(backup).toBe(serialize([buildHabit("a", "Ler")]));

    act(() => result.current.remove("a"));
    expect(result.current.habits).toHaveLength(0);

    let imported!: ReturnType<typeof result.current.importBackup>;
    act(() => {
      imported = result.current.importBackup(backup);
    });
    expect(imported.ok).toBe(true);
    expect(result.current.habits.map((habit) => habit.name)).toEqual(["Ler"]);
  });

  it("mantém a lista quando o backup é inválido", () => {
    const { result } = setup([buildHabit("a", "Ler")]);
    let imported!: ReturnType<typeof result.current.importBackup>;
    act(() => {
      imported = result.current.importBackup("isto não é json");
    });

    expect(imported).toEqual({ ok: false, error: "O arquivo não é um JSON válido." });
    expect(result.current.habits.map((habit) => habit.name)).toEqual(["Ler"]);
  });
});
