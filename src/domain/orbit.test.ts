import { addDays, lastNDays } from "./dates";
import type { Habit } from "./habit";
import { FIRST_ORBIT, hashToUnit, ORBIT_GAP, orbitFor } from "./orbit";

const TODAY = "2026-11-20";

function buildHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "planeta-1",
    name: "Beber água",
    color: "#60a5fa",
    kind: "rochoso",
    weeklyTarget: 7,
    createdAt: addDays(TODAY, -60),
    checkins: [],
    ...overrides,
  };
}

describe("órbitas dos planetas", () => {
  it("afasta cada planeta do sol conforme sua posição na lista", () => {
    expect(orbitFor(buildHabit(), 0, TODAY).radius).toBe(FIRST_ORBIT);
    expect(orbitFor(buildHabit(), 2, TODAY).radius).toBe(FIRST_ORBIT + 2 * ORBIT_GAP);
  });

  it("faz planetas mais distantes girarem mais devagar", () => {
    const near = orbitFor(buildHabit(), 0, TODAY);
    const far = orbitFor(buildHabit(), 4, TODAY);
    expect(far.speed).toBeLessThan(near.speed);
  });

  it("aumenta o tamanho do planeta com a sequência até um limite", () => {
    const empty = orbitFor(buildHabit(), 0, TODAY);
    const growing = orbitFor(buildHabit({ checkins: lastNDays(TODAY, 10) }), 0, TODAY);
    const huge = orbitFor(buildHabit({ checkins: lastNDays(TODAY, 30) }), 0, TODAY);
    const capped = orbitFor(buildHabit({ checkins: lastNDays(TODAY, 50) }), 0, TODAY);
    expect(growing.size).toBeGreaterThan(empty.size);
    expect(huge.size).toBeGreaterThan(growing.size);
    expect(capped.size).toBe(huge.size);
  });

  it("dá anéis a gigantes gasosos e a sequências de duas semanas", () => {
    expect(orbitFor(buildHabit({ kind: "gasoso" }), 0, TODAY).rings).toBe(true);
    expect(orbitFor(buildHabit(), 0, TODAY).rings).toBe(false);
    expect(orbitFor(buildHabit({ checkins: lastNDays(TODAY, 14) }), 0, TODAY).rings).toBe(true);
  });

  it("ganha uma lua a cada semana de maior sequência, até três", () => {
    expect(orbitFor(buildHabit({ checkins: lastNDays(TODAY, 7) }), 0, TODAY).moons).toBe(1);
    expect(orbitFor(buildHabit({ checkins: lastNDays(TODAY, 40) }), 0, TODAY).moons).toBe(3);
  });

  it("posiciona o mesmo hábito sempre na mesma fase inicial", () => {
    expect(orbitFor(buildHabit(), 0, TODAY).phase).toBe(orbitFor(buildHabit(), 3, TODAY).phase);
  });

  it("gera sementes entre 0 e 1 diferentes para ids diferentes", () => {
    const a = hashToUnit("a");
    const b = hashToUnit("b");
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(1);
    expect(a).not.toBe(b);
  });
});
