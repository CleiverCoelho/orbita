import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Habit } from "../domain/habit";
import { HabitList } from "./HabitList";

const TODAY = "2026-11-20";

const habits: Habit[] = [
  { id: "a", name: "Ler", color: "#5eead4", kind: "gelo", weeklyTarget: 5, createdAt: "2026-11-01", checkins: ["2026-11-19", TODAY] },
  { id: "b", name: "Correr", color: "#ff7a59", kind: "lava", weeklyTarget: 3, createdAt: "2026-11-01", checkins: [] },
];

function renderList(overrides: Partial<Parameters<typeof HabitList>[0]> = {}) {
  const props = {
    habits,
    today: TODAY,
    selectedId: null,
    query: "",
    onQueryChange: vi.fn(),
    onToggle: vi.fn(),
    onSelect: vi.fn(),
    onLoadSample: vi.fn(),
    ...overrides,
  };
  render(<HabitList {...props} />);
  return props;
}

describe("lista de hábitos do dia", () => {
  it("convida a carregar o exemplo quando não há hábitos", async () => {
    const props = renderList({ habits: [] });
    await userEvent.click(screen.getByRole("button", { name: "Carregar sistema de exemplo" }));
    expect(props.onLoadSample).toHaveBeenCalled();
  });

  it("mostra a sequência e o estado do check-in de cada hábito", () => {
    renderList();
    expect(screen.getByRole("button", { name: "Marcar Ler como feito hoje" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Marcar Correr como feito hoje" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getAllByTestId("streak").map((item) => item.textContent)).toEqual(["2 dias", "0 dias"]);
  });

  it("marca o hábito de hoje ao clicar no botão de check-in", async () => {
    const props = renderList();
    await userEvent.click(screen.getByRole("button", { name: "Marcar Correr como feito hoje" }));
    expect(props.onToggle).toHaveBeenCalledWith("b", TODAY);
  });

  it("seleciona o hábito ao clicar no nome", async () => {
    const props = renderList();
    await userEvent.click(screen.getByRole("button", { name: /^Correr/ }));
    expect(props.onSelect).toHaveBeenCalledWith("b");
  });

  it("filtra hábitos pela busca sem diferenciar maiúsculas", () => {
    renderList({ query: "COR" });
    expect(screen.queryByRole("button", { name: "Marcar Ler como feito hoje" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Marcar Correr como feito hoje" })).toBeInTheDocument();
  });

  it("avisa quando a busca não encontra nenhum planeta", () => {
    renderList({ query: "nadar" });
    expect(screen.getByText("Nenhum planeta com “nadar”.")).toBeInTheDocument();
  });

  it("repassa o texto digitado na busca", async () => {
    const props = renderList();
    await userEvent.type(screen.getByRole("searchbox", { name: "Buscar planeta" }), "L");
    expect(props.onQueryChange).toHaveBeenCalledWith("L");
  });
});
