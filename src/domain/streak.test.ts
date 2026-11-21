import { currentStreak, levelFor, levelProgress, longestStreak } from "./streak";

const TODAY = "2026-11-20";

describe("sequência atual", () => {
  it("é zero quando não há check-ins", () => {
    expect(currentStreak([], TODAY)).toBe(0);
  });

  it("conta dias consecutivos terminando hoje", () => {
    expect(currentStreak(["2026-11-18", "2026-11-19", TODAY], TODAY)).toBe(3);
  });

  it("continua viva se o último check-in foi ontem", () => {
    expect(currentStreak(["2026-11-18", "2026-11-19"], TODAY)).toBe(2);
  });

  it("zera quando o último check-in foi anteontem", () => {
    expect(currentStreak(["2026-11-17", "2026-11-18"], TODAY)).toBe(0);
  });

  it("para de contar ao encontrar um dia sem check-in", () => {
    expect(currentStreak(["2026-11-15", "2026-11-17", "2026-11-18", "2026-11-19", TODAY], TODAY)).toBe(4);
  });
});

describe("maior sequência", () => {
  it("encontra o maior bloco de dias consecutivos em qualquer período", () => {
    const checkins = ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-11-19", TODAY];
    expect(longestStreak(checkins)).toBe(4);
  });

  it("ignora datas duplicadas e fora de ordem", () => {
    expect(longestStreak(["2026-11-03", "2026-11-01", "2026-11-02", "2026-11-02"])).toBe(3);
  });

  it("é zero sem check-ins", () => {
    expect(longestStreak([])).toBe(0);
  });
});

describe("níveis cósmicos", () => {
  it.each([
    [0, "Poeira cósmica"],
    [1, "Asteroide"],
    [3, "Lua"],
    [7, "Planeta"],
    [14, "Gigante gasoso"],
    [30, "Estrela"],
    [365, "Estrela"],
  ])("uma sequência de %i dias corresponde ao nível %s", (streak, name) => {
    expect(levelFor(streak).name).toBe(name);
  });

  it("mede o progresso até o próximo nível", () => {
    expect(levelProgress(5)).toBe(0.5);
    expect(levelProgress(7)).toBe(0);
  });

  it("considera o nível máximo sempre completo", () => {
    expect(levelProgress(42)).toBe(1);
  });
});
