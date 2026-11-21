import { createHabit, type Habit, type HabitInput, renameHabit, toggleCheckin, validateHabitInput } from "./habit";

const TODAY = "2026-11-20";

const validInput: HabitInput = {
  name: "Ler 20 páginas",
  color: "#5EEAD4",
  kind: "gelo",
  weeklyTarget: 5,
};

function buildHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "h1",
    name: "Meditar",
    color: "#8b7dff",
    kind: "gasoso",
    weeklyTarget: 7,
    createdAt: "2026-11-01",
    checkins: [],
    ...overrides,
  };
}

describe("criação de hábitos", () => {
  it("cria um hábito sem check-ins com nome normalizado e cor em minúsculas", () => {
    const result = createHabit({ ...validInput, name: "  Ler   20 páginas " }, { id: "abc", today: TODAY });

    expect(result).toEqual({
      ok: true,
      habit: {
        id: "abc",
        name: "Ler 20 páginas",
        color: "#5eead4",
        kind: "gelo",
        weeklyTarget: 5,
        createdAt: TODAY,
        checkins: [],
      },
    });
  });

  it("rejeita nomes curtos demais", () => {
    expect(validateHabitInput({ ...validInput, name: " a " }).name).toMatch(/pelo menos 2/);
  });

  it("rejeita nomes longos demais", () => {
    expect(validateHabitInput({ ...validInput, name: "x".repeat(33) }).name).toMatch(/no máximo 32/);
  });

  it("rejeita nomes repetidos sem diferenciar maiúsculas", () => {
    const errors = validateHabitInput({ ...validInput, name: "meditar" }, ["Meditar"]);
    expect(errors.name).toBe("Já existe um planeta com esse nome.");
  });

  it("rejeita metas semanais fora do intervalo de 1 a 7", () => {
    expect(validateHabitInput({ ...validInput, weeklyTarget: 0 }).weeklyTarget).toBeDefined();
    expect(validateHabitInput({ ...validInput, weeklyTarget: 8 }).weeklyTarget).toBeDefined();
    expect(validateHabitInput({ ...validInput, weeklyTarget: 2.5 }).weeklyTarget).toBeDefined();
  });

  it("rejeita cor e tipo de planeta inválidos", () => {
    const errors = validateHabitInput({ ...validInput, color: "azul", kind: "plasma" as HabitInput["kind"] });
    expect(errors.color).toBe("Escolha uma cor válida.");
    expect(errors.kind).toBe("Tipo de planeta desconhecido.");
  });

  it("devolve os erros em vez do hábito quando a entrada é inválida", () => {
    const result = createHabit({ ...validInput, name: "" }, { id: "abc", today: TODAY });
    expect(result.ok).toBe(false);
  });
});

describe("check-ins", () => {
  it("marca um dia ainda não feito mantendo as datas ordenadas", () => {
    const habit = buildHabit({ checkins: ["2026-11-19"] });
    expect(toggleCheckin(habit, "2026-11-18", TODAY).checkins).toEqual(["2026-11-18", "2026-11-19"]);
  });

  it("desmarca um dia que já estava feito", () => {
    const habit = buildHabit({ checkins: ["2026-11-19", TODAY] });
    expect(toggleCheckin(habit, TODAY, TODAY).checkins).toEqual(["2026-11-19"]);
  });

  it("ignora check-ins em datas futuras", () => {
    const habit = buildHabit();
    expect(toggleCheckin(habit, "2026-11-21", TODAY)).toBe(habit);
  });

  it("não altera o hábito original", () => {
    const habit = buildHabit();
    toggleCheckin(habit, TODAY, TODAY);
    expect(habit.checkins).toEqual([]);
  });
});

describe("renomear hábitos", () => {
  it("renomeia quando o novo nome é válido", () => {
    const result = renameHabit(buildHabit(), " Respirar fundo ", ["Correr"]);
    expect(result.ok && result.habit.name).toBe("Respirar fundo");
  });

  it("impede renomear para o nome de outro hábito", () => {
    const result = renameHabit(buildHabit(), "Correr", ["Correr"]);
    expect(result).toEqual({ ok: false, errors: { name: "Já existe um planeta com esse nome." } });
  });
});
