export type DateKey = string;

const DAY_MS = 24 * 60 * 60 * 1000;
const KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number) => String(value).padStart(2, "0");

export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isDateKey(value: unknown): value is DateKey {
  if (typeof value !== "string") return false;
  const match = KEY_PATTERN.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function fromDateKey(key: DateKey): Date {
  if (!isDateKey(key)) {
    throw new Error(`Data inválida: ${key}`);
  }
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(key: DateKey, amount: number): DateKey {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function daysBetween(from: DateKey, to: DateKey): number {
  const start = fromDateKey(from);
  const end = fromDateKey(to);
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((utcEnd - utcStart) / DAY_MS);
}

export function lastNDays(today: DateKey, amount: number): DateKey[] {
  return Array.from({ length: amount }, (_, index) => addDays(today, index - amount + 1));
}

export function startOfWeek(key: DateKey): DateKey {
  const weekday = fromDateKey(key).getDay();
  const offset = (weekday + 6) % 7;
  return addDays(key, -offset);
}

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function weekdayInitial(key: DateKey): string {
  return WEEKDAY_LABELS[fromDateKey(key).getDay()];
}
