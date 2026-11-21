import { addDays, type DateKey } from "./dates";
import type { Habit, PlanetKind } from "./habit";

interface Template {
  name: string;
  color: string;
  kind: PlanetKind;
  weeklyTarget: number;
  streak: number;
  scattered: number;
}

const TEMPLATES: Template[] = [
  { name: "Meditar 10 minutos", color: "#8b7dff", kind: "gasoso", weeklyTarget: 7, streak: 16, scattered: 6 },
  { name: "Ler 20 páginas", color: "#5eead4", kind: "gelo", weeklyTarget: 5, streak: 8, scattered: 10 },
  { name: "Correr 5 km", color: "#ff7a59", kind: "lava", weeklyTarget: 3, streak: 2, scattered: 8 },
  { name: "Beber 2L de água", color: "#60a5fa", kind: "rochoso", weeklyTarget: 7, streak: 31, scattered: 0 },
];

export function sampleHabits(today: DateKey, makeId: () => string): Habit[] {
  return TEMPLATES.map((template) => {
    const recent = Array.from({ length: template.streak }, (_, index) => addDays(today, -index));
    const older = Array.from({ length: template.scattered }, (_, index) => addDays(today, -(template.streak + 2 + index * 3)));
    return {
      id: makeId(),
      name: template.name,
      color: template.color,
      kind: template.kind,
      weeklyTarget: template.weeklyTarget,
      createdAt: addDays(today, -60),
      checkins: [...recent, ...older].sort(),
    };
  });
}
