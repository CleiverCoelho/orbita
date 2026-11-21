import { type DateKey, fromDateKey } from "../domain/dates";

const dayFormatter = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" });

export function formatDay(key: DateKey): string {
  return dayFormatter.format(fromDateKey(key));
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
