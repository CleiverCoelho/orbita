import type { DateKey } from "./dates";
import { type Habit, renameHabit, toggleCheckin } from "./habit";

export interface State {
  habits: Habit[];
  selectedId: string | null;
}

export type Action =
  | { type: "add"; habit: Habit }
  | { type: "remove"; id: string }
  | { type: "toggle"; id: string; day: DateKey; today: DateKey }
  | { type: "rename"; id: string; name: string }
  | { type: "select"; id: string | null }
  | { type: "replace"; habits: Habit[] };

export const initialState: State = { habits: [], selectedId: null };

function updateHabit(state: State, id: string, change: (habit: Habit) => Habit): State {
  return { ...state, habits: state.habits.map((habit) => (habit.id === id ? change(habit) : habit)) };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add":
      return { habits: [...state.habits, action.habit], selectedId: action.habit.id };
    case "remove":
      return {
        habits: state.habits.filter((habit) => habit.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    case "toggle":
      return updateHabit(state, action.id, (habit) => toggleCheckin(habit, action.day, action.today));
    case "rename": {
      const others = state.habits.filter((habit) => habit.id !== action.id).map((habit) => habit.name);
      return updateHabit(state, action.id, (habit) => {
        const result = renameHabit(habit, action.name, others);
        return result.ok ? result.habit : habit;
      });
    }
    case "select":
      return { ...state, selectedId: state.habits.some((habit) => habit.id === action.id) ? action.id : null };
    case "replace":
      return { habits: action.habits, selectedId: null };
  }
}
