import {
  addDays,
  daysBetween,
  fromDateKey,
  isDateKey,
  lastNDays,
  startOfWeek,
  toDateKey,
  weekdayInitial,
} from "./dates";

describe("datas", () => {
  it("formata uma data local como chave AAAA-MM-DD", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("reconhece apenas chaves de datas que existem no calendário", () => {
    expect(isDateKey("2024-02-29")).toBe(true);
    expect(isDateKey("2025-02-29")).toBe(false);
    expect(isDateKey("2026-13-01")).toBe(false);
    expect(isDateKey("ontem")).toBe(false);
    expect(isDateKey(20260101)).toBe(false);
  });

  it("recusa converter uma chave inválida", () => {
    expect(() => fromDateKey("2026-02-30")).toThrow("Data inválida");
  });

  it("soma dias atravessando a virada de mês e de ano", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("calcula a distância em dias entre duas datas", () => {
    expect(daysBetween("2026-11-01", "2026-11-20")).toBe(19);
    expect(daysBetween("2026-11-20", "2026-11-01")).toBe(-19);
  });

  it("lista os últimos N dias terminando hoje, em ordem cronológica", () => {
    expect(lastNDays("2026-11-20", 3)).toEqual(["2026-11-18", "2026-11-19", "2026-11-20"]);
  });

  it("considera segunda-feira o início da semana", () => {
    expect(startOfWeek("2026-11-20")).toBe("2026-11-16");
    expect(startOfWeek("2026-11-22")).toBe("2026-11-16");
    expect(startOfWeek("2026-11-16")).toBe("2026-11-16");
  });

  it("devolve a inicial do dia da semana em português", () => {
    expect(weekdayInitial("2026-11-20")).toBe("S");
    expect(weekdayInitial("2026-11-18")).toBe("Q");
    expect(weekdayInitial("2026-11-22")).toBe("D");
  });
});
