import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Habit } from "../domain/habit";
import { CssOrrery } from "./CssOrrery";
import { SceneBoundary } from "./SceneBoundary";

const habit: Habit = { id: "a", name: "Ler", color: "#5eead4", kind: "gelo", weeklyTarget: 5, createdAt: "2026-11-01", checkins: [] };

describe("planetário em CSS", () => {
  it("desenha um planeta clicável para cada hábito", async () => {
    const onSelect = vi.fn();
    render(<CssOrrery habits={[habit]} today="2026-11-20" selectedId="a" onSelect={onSelect} />);

    expect(screen.getByTestId("scene")).toHaveAttribute("data-planets", "1");
    await userEvent.click(screen.getByRole("button", { name: "Ver planeta Ler" }));
    expect(onSelect).toHaveBeenCalledWith("a");
  });
});

describe("proteção da cena 3D", () => {
  it("mostra a alternativa quando a cena lança um erro", () => {
    const silence = vi.spyOn(console, "error").mockImplementation(() => {});
    function Broken(): never {
      throw new Error("WebGL indisponível");
    }
    render(
      <SceneBoundary fallback={<p>Planetário alternativo</p>}>
        <Broken />
      </SceneBoundary>,
    );
    expect(screen.getByText("Planetário alternativo")).toBeInTheDocument();
    silence.mockRestore();
  });

  it("mostra a cena normalmente quando não há erro", () => {
    render(
      <SceneBoundary fallback={<p>Planetário alternativo</p>}>
        <p>Cena 3D</p>
      </SceneBoundary>,
    );
    expect(screen.getByText("Cena 3D")).toBeInTheDocument();
  });
});
