import type { Habit } from "./habit";
import { initialState, reducer, type State } from "./reducer";

const TODAY = "2026-11-20";

function buildHabit(id: string, name: string): Habit {
  return { id, name, color: "#ffc857", kind: "rochoso", weeklyTarget: 3, createdAt: TODAY, checkins: [] };
}

const withTwo: State = { habits: [buildHabit("a", "Ler"), buildHabit("b", "Correr")], selectedId: "a" };

describe("estado da aplicação", () => {
  it("adiciona um hábito e já o seleciona", () => {
    const state = reducer(initialState, { type: "add", habit: buildHabit("a", "Ler") });
    expect(state.habits.map((habit) => habit.id)).toEqual(["a"]);
    expect(state.selectedId).toBe("a");
  });

  it("remove um hábito e limpa a seleção se ele estava selecionado", () => {
    const state = reducer(withTwo, { type: "remove", id: "a" });
    expect(state.habits.map((habit) => habit.id)).toEqual(["b"]);
    expect(state.selectedId).toBeNull();
  });

  it("mantém a seleção ao remover outro hábito", () => {
    expect(reducer(withTwo, { type: "remove", id: "b" }).selectedId).toBe("a");
  });

  it("marca o check-in apenas do hábito indicado", () => {
    const state = reducer(withTwo, { type: "toggle", id: "b", day: TODAY, today: TODAY });
    expect(state.habits[0].checkins).toEqual([]);
    expect(state.habits[1].checkins).toEqual([TODAY]);
  });

  it("renomeia um hábito com nome válido", () => {
    const state = reducer(withTwo, { type: "rename", id: "a", name: "Ler livros" });
    expect(state.habits[0].name).toBe("Ler livros");
  });

  it("ignora renomear para um nome já usado por outro hábito", () => {
    const state = reducer(withTwo, { type: "rename", id: "a", name: "correr" });
    expect(state.habits[0].name).toBe("Ler");
  });

  it("só seleciona hábitos existentes", () => {
    expect(reducer(withTwo, { type: "select", id: "b" }).selectedId).toBe("b");
    expect(reducer(withTwo, { type: "select", id: "zzz" }).selectedId).toBeNull();
    expect(reducer(withTwo, { type: "select", id: null }).selectedId).toBeNull();
  });

  it("substitui todos os hábitos ao importar um backup", () => {
    const state = reducer(withTwo, { type: "replace", habits: [buildHabit("c", "Nadar")] });
    expect(state).toEqual({ habits: [buildHabit("c", "Nadar")], selectedId: null });
  });
});
