import { isDateKey } from "./dates";
import { type Habit, PLANET_KINDS, validateHabitInput } from "./habit";

export const STORAGE_KEY = "orbita:v1";
const SCHEMA_VERSION = 1;

interface Snapshot {
  version: number;
  habits: Habit[];
}

function isHabit(value: unknown): value is Habit {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.name === "string" &&
    typeof candidate.color === "string" &&
    typeof candidate.weeklyTarget === "number" &&
    PLANET_KINDS.includes(candidate.kind as Habit["kind"]) &&
    isDateKey(candidate.createdAt) &&
    Array.isArray(candidate.checkins) &&
    candidate.checkins.every(isDateKey) &&
    Object.keys(validateHabitInput(candidate as unknown as Habit)).length === 0
  );
}

export function serialize(habits: Habit[]): string {
  const snapshot: Snapshot = { version: SCHEMA_VERSION, habits };
  return JSON.stringify(snapshot);
}

export type ParseResult = { ok: true; habits: Habit[] } | { ok: false; error: string };

export function parse(raw: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, error: "O arquivo não é um JSON válido." };
  }
  const list = Array.isArray(data) ? data : (data as Partial<Snapshot> | null)?.habits;
  if (!Array.isArray(list)) {
    return { ok: false, error: "Nenhuma lista de hábitos encontrada." };
  }
  const seen = new Set<string>();
  const habits = list.filter(isHabit).filter((habit) => {
    if (seen.has(habit.id)) return false;
    seen.add(habit.id);
    return true;
  });
  return {
    ok: true,
    habits: habits.map((habit) => ({ ...habit, checkins: [...new Set(habit.checkins)].sort() })),
  };
}

export interface HabitRepository {
  load(): Habit[];
  save(habits: Habit[]): void;
}

export function createRepository(storage: Pick<Storage, "getItem" | "setItem">, key = STORAGE_KEY): HabitRepository {
  return {
    load() {
      const raw = storage.getItem(key);
      if (!raw) return [];
      const result = parse(raw);
      return result.ok ? result.habits : [];
    },
    save(habits) {
      storage.setItem(key, serialize(habits));
    },
  };
}
