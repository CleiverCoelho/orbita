import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addDays, lastNDays } from "../domain/dates";
import type { Habit } from "../domain/habit";
import { PlanetDetail } from "./PlanetDetail";

const TODAY = "2026-11-20";

function buildHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "a",
    name: "Meditar",
    color: "#8b7dff",
    kind: "gasoso",
    weeklyTarget: 3,
    createdAt: addDays(TODAY, -40),
    checkins: lastNDays(TODAY, 4),
    ...overrides,
  };
}

function renderDetail(habit = buildHabit()) {
  const handlers = { onToggle: vi.fn(), onRename: vi.fn(), onRemove: vi.fn(), onClose: vi.fn() };
  render(<PlanetDetail habit={habit} today={TODAY} {...handlers} />);
  return handlers;
}

describe("detalhes do planeta", () => {
  it("apresenta nível, sequência e meta da semana", () => {
    renderDetail();
    expect(screen.getByRole("heading", { name: "Meditar" })).toBeInTheDocument();
    expect(screen.getByText("Lua")).toBeInTheDocument();
    expect(screen.getByTestId("detail-streak")).toHaveTextContent("4 dias");
    expect(screen.getByText("Faltam 3 dias para o próximo nível.")).toBeInTheDocument();
    expect(screen.getByText("4 de 3")).toHaveClass("metrics--met");
  });

  it("celebra o nível máximo", () => {
    renderDetail(buildHabit({ checkins: lastNDays(TODAY, 30) }));
    expect(screen.getByText("Estrela")).toBeInTheDocument();
    expect(screen.getByText(/Nível máximo/)).toBeInTheDocument();
  });

  it("alterna check-ins de dias anteriores pelo calendário", async () => {
    const handlers = renderDetail();
    const day = screen.getByRole("button", { name: "10 de novembro" });
    expect(day).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(day);
    expect(handlers.onToggle).toHaveBeenCalledWith("2026-11-10");
  });

  it("renomeia o planeta pelo formulário em linha", async () => {
    const handlers = renderDetail();
    await userEvent.click(screen.getByRole("button", { name: "Renomear" }));
    const input = screen.getByLabelText("Novo nome");
    await userEvent.clear(input);
    await userEvent.type(input, "Respirar{Enter}");
    expect(handlers.onRename).toHaveBeenCalledWith("Respirar");
    expect(screen.queryByLabelText("Novo nome")).not.toBeInTheDocument();
  });

  it("permite desistir de renomear", async () => {
    const handlers = renderDetail();
    await userEvent.click(screen.getByRole("button", { name: "Renomear" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(handlers.onRename).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Meditar" })).toBeInTheDocument();
  });

  it("pede confirmação antes de remover", async () => {
    const handlers = renderDetail();
    await userEvent.click(screen.getByRole("button", { name: "Remover planeta" }));
    await userEvent.click(screen.getByRole("button", { name: "Manter" }));
    expect(handlers.onRemove).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Remover planeta" }));
    await userEvent.click(screen.getByRole("button", { name: "Remover de vez" }));
    expect(handlers.onRemove).toHaveBeenCalled();
  });

  it("fecha o painel pelo botão de fechar", async () => {
    const handlers = renderDetail();
    await userEvent.click(screen.getByRole("button", { name: "Fechar detalhes" }));
    expect(handlers.onClose).toHaveBeenCalled();
  });

  it("inclina o cartão acompanhando o ponteiro e volta ao soltar", () => {
    renderDetail();
    const panel = screen.getByRole("complementary", { name: "Detalhes de Meditar" });
    panel.getBoundingClientRect = () => ({ top: 0, left: 0, width: 200, height: 100 }) as DOMRect;
    fireEvent.pointerMove(panel, { clientX: 200, clientY: 0 });
    expect(panel.style.getPropertyValue("--tilt-y")).toBe("5deg");
    fireEvent.pointerLeave(panel);
    expect(panel.style.getPropertyValue("--tilt-y")).toBe("0deg");
  });
});
