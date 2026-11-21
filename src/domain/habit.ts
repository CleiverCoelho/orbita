import { type DateKey, isDateKey } from "./dates";

export const PLANET_KINDS = ["rochoso", "gasoso", "gelo", "lava"] as const;
export type PlanetKind = (typeof PLANET_KINDS)[number];

export const PALETTE = ["#ff7a59", "#ffc857", "#5eead4", "#8b7dff", "#f472b6", "#60a5fa"] as const;

export const NAME_MIN = 2;
export const NAME_MAX = 32;

export interface Habit {
  id: string;
  name: string;
  color: string;
  kind: PlanetKind;
  weeklyTarget: number;
  createdAt: DateKey;
  checkins: DateKey[];
}

export interface HabitInput {
  name: string;
  color: string;
  kind: PlanetKind;
  weeklyTarget: number;
}

export type HabitErrors = Partial<Record<keyof HabitInput, string>>;

export type CreateResult =
  | { ok: true; habit: Habit }
  | { ok: false; errors: HabitErrors };

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function validateHabitInput(input: HabitInput, existingNames: string[] = []): HabitErrors {
  const errors: HabitErrors = {};
  const name = normalizeName(input.name);

  if (name.length < NAME_MIN) {
    errors.name = `O nome precisa ter pelo menos ${NAME_MIN} caracteres.`;
  } else if (name.length > NAME_MAX) {
    errors.name = `O nome pode ter no máximo ${NAME_MAX} caracteres.`;
  } else if (existingNames.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
    errors.name = "Já existe um planeta com esse nome.";
  }

  if (!HEX_COLOR.test(input.color)) {
    errors.color = "Escolha uma cor válida.";
  }

  if (!PLANET_KINDS.includes(input.kind)) {
    errors.kind = "Tipo de planeta desconhecido.";
  }

  if (!Number.isInteger(input.weeklyTarget) || input.weeklyTarget < 1 || input.weeklyTarget > 7) {
    errors.weeklyTarget = "A meta semanal deve ficar entre 1 e 7 dias.";
  }

  return errors;
}

export function createHabit(
  input: HabitInput,
  context: { id: string; today: DateKey; existingNames?: string[] },
): CreateResult {
  const errors = validateHabitInput(input, context.existingNames);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    habit: {
      id: context.id,
      name: normalizeName(input.name),
      color: input.color.toLowerCase(),
      kind: input.kind,
      weeklyTarget: input.weeklyTarget,
      createdAt: context.today,
      checkins: [],
    },
  };
}

export function isDoneOn(habit: Habit, day: DateKey): boolean {
  return habit.checkins.includes(day);
}

export function toggleCheckin(habit: Habit, day: DateKey, today: DateKey): Habit {
  if (!isDateKey(day) || day > today) {
    return habit;
  }
  const checkins = isDoneOn(habit, day)
    ? habit.checkins.filter((existing) => existing !== day)
    : [...habit.checkins, day].sort();
  return { ...habit, checkins };
}

export function renameHabit(habit: Habit, name: string, otherNames: string[]): CreateResult {
  const errors = validateHabitInput({ ...habit, name }, otherNames);
  if (errors.name) {
    return { ok: false, errors: { name: errors.name } };
  }
  return { ok: true, habit: { ...habit, name: normalizeName(name) } };
}
