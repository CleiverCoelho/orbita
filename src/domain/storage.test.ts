import type { Habit } from "./habit";
import { createRepository, parse, serialize, STORAGE_KEY } from "./storage";

const habit: Habit = {
  id: "h1",
  name: "Alongar",
  color: "#f472b6",
  kind: "gelo",
  weeklyTarget: 4,
  createdAt: "2026-11-01",
  checkins: ["2026-11-02", "2026-11-03"],
};

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("serialização", () => {
  it("recupera exatamente os hábitos que foram serializados", () => {
    expect(parse(serialize([habit]))).toEqual({ ok: true, habits: [habit] });
  });

  it("aceita também uma lista simples de hábitos", () => {
    expect(parse(JSON.stringify([habit]))).toEqual({ ok: true, habits: [habit] });
  });

  it("informa erro para conteúdo que não é JSON", () => {
    expect(parse("{quebrado")).toEqual({ ok: false, error: "O arquivo não é um JSON válido." });
  });

  it("informa erro quando não encontra lista de hábitos", () => {
    expect(parse(JSON.stringify({ outra: 1 }))).toEqual({ ok: false, error: "Nenhuma lista de hábitos encontrada." });
    expect(parse("null").ok).toBe(false);
  });

  it("descarta hábitos inválidos e ids duplicados", () => {
    const raw = JSON.stringify([
      habit,
      { ...habit, name: "Duplicado" },
      { ...habit, id: "h2", weeklyTarget: 12 },
      { ...habit, id: "h3", checkins: ["amanhã"] },
      { ...habit, id: "h4", kind: "plasma" },
      "texto",
    ]);
    expect(parse(raw)).toEqual({ ok: true, habits: [habit] });
  });

  it("ordena e remove check-ins repetidos ao importar", () => {
    const raw = JSON.stringify([{ ...habit, checkins: ["2026-11-03", "2026-11-02", "2026-11-03"] }]);
    const result = parse(raw);
    expect(result.ok && result.habits[0].checkins).toEqual(["2026-11-02", "2026-11-03"]);
  });
});

describe("repositório local", () => {
  it("começa vazio quando nada foi salvo", () => {
    expect(createRepository(memoryStorage()).load()).toEqual([]);
  });

  it("salva e carrega hábitos pela mesma chave", () => {
    const storage = memoryStorage();
    const repository = createRepository(storage);
    repository.save([habit]);
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(createRepository(storage).load()).toEqual([habit]);
  });

  it("ignora dados corrompidos sem quebrar a aplicação", () => {
    const repository = createRepository(memoryStorage({ [STORAGE_KEY]: "não é json" }));
    expect(repository.load()).toEqual([]);
  });
});
