import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type CreateResult, createHabit, type HabitInput } from "../domain/habit";
import { HabitForm } from "./HabitForm";

const TODAY = "2026-11-20";

function setup(existingNames: string[] = []) {
  const onCreate = vi.fn(
    (input: HabitInput): CreateResult => createHabit(input, { id: "novo", today: TODAY, existingNames }),
  );
  const user = userEvent.setup();
  render(<HabitForm onCreate={onCreate} />);
  return { onCreate, user, name: screen.getByLabelText("Hábito") };
}

describe("formulário de novo planeta", () => {
  it("começa com nome vazio, primeira cor, superfície rochosa e meta de 5 dias", () => {
    setup();
    expect(screen.getByLabelText("Hábito")).toHaveValue("");
    expect(screen.getByRole("radio", { name: "Coral" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Rochoso" })).toBeChecked();
    expect(screen.getByRole("slider")).toHaveValue("5");
    expect(screen.getByText(/dias por semana/)).toBeInTheDocument();
  });

  it("mostra o erro de validação e marca o campo como inválido", async () => {
    const { onCreate, user, name } = setup();
    await user.click(screen.getByRole("button", { name: "Lançar planeta" }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("pelo menos 2 caracteres");
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAttribute("aria-describedby", alert.id);
  });

  it("envia os valores escolhidos e limpa apenas o nome e a meta após o sucesso", async () => {
    const { onCreate, user, name } = setup();
    await user.type(name, "Ler livros");
    await user.click(screen.getByRole("radio", { name: "Lavanda" }));
    await user.click(screen.getByRole("radio", { name: "Gelo" }));
    fireEvent.change(screen.getByRole("slider"), { target: { value: "1" } });
    expect(screen.getByText(/dia por semana/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Lançar planeta" }));

    expect(onCreate).toHaveBeenCalledWith({ name: "Ler livros", color: "#8b7dff", kind: "gelo", weeklyTarget: 1 });
    expect(onCreate.mock.results[0].value.ok).toBe(true);
    expect(name).toHaveValue("");
    expect(screen.getByRole("slider")).toHaveValue("5");
    expect(screen.getByRole("radio", { name: "Lavanda" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Gelo" })).toBeChecked();
  });

  it("remove a mensagem de erro quando o envio seguinte dá certo", async () => {
    const { user, name } = setup(["Correr"]);
    await user.type(name, "correr");
    await user.click(screen.getByRole("button", { name: "Lançar planeta" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Já existe um planeta com esse nome.");

    await user.clear(name);
    await user.type(name, "Nadar");
    await user.click(screen.getByRole("button", { name: "Lançar planeta" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(name).toHaveAttribute("aria-invalid", "false");
    expect(name).not.toHaveAttribute("aria-describedby");
  });
});
