import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { DateKey } from "../domain/dates";
import { createHabit, type CreateResult, type HabitInput } from "../domain/habit";
import { reducer } from "../domain/reducer";
import { sampleHabits } from "../domain/sample";
import { type HabitRepository, parse, type ParseResult, serialize } from "../domain/storage";
import { createId } from "../lib/ids";

export function useHabits(repository: HabitRepository, today: DateKey) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    habits: repository.load(),
    selectedId: null,
  }));

  useEffect(() => {
    repository.save(state.habits);
  }, [repository, state.habits]);

  const add = useCallback(
    (input: HabitInput): CreateResult => {
      const result = createHabit(input, {
        id: createId(),
        today,
        existingNames: state.habits.map((habit) => habit.name),
      });
      if (result.ok) dispatch({ type: "add", habit: result.habit });
      return result;
    },
    [state.habits, today],
  );

  const actions = useMemo(
    () => ({
      toggle: (id: string, day: DateKey) => dispatch({ type: "toggle", id, day, today }),
      remove: (id: string) => dispatch({ type: "remove", id }),
      rename: (id: string, name: string) => dispatch({ type: "rename", id, name }),
      select: (id: string | null) => dispatch({ type: "select", id }),
      loadSample: () => dispatch({ type: "replace", habits: sampleHabits(today, createId) }),
      importBackup: (raw: string): ParseResult => {
        const result = parse(raw);
        if (result.ok) dispatch({ type: "replace", habits: result.habits });
        return result;
      },
    }),
    [today],
  );

  const exportBackup = useCallback(() => serialize(state.habits), [state.habits]);

  const selected = state.habits.find((habit) => habit.id === state.selectedId) ?? null;

  return { habits: state.habits, selected, add, exportBackup, ...actions };
}
