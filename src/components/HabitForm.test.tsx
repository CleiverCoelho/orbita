import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HabitForm } from "./HabitForm";

describe("formulário de novo planeta", () => {
  it("envia os dados escolhidos e limpa o nome após o sucesso", async () => {
    const onCreate = vi.fn().mockReturnValue({ ok: true, habit: {} });
    render(<HabitForm onCreate={onCreate} />);

    await userEvent.type(screen.getByLabelText("Hábito"), "Estudar inglês");
    await userEvent.click(screen.getByLabelText("Lavanda"));
    await userEvent.click(screen.getByLabelText("Gasoso"));
    await userEvent.click(screen.getByRole("button", { name: "Lançar planeta" }));

    expect(onCreate).toHaveBeenCalledWith({ name: "Estudar inglês", color: "#8b7dff", kind: "gasoso", weeklyTarget: 5 });
    expect(screen.getByLabelText("Hábito")).toHaveValue("");
  });

  it("mostra a mensagem de erro devolvida pela validação", async () => {
    const onCreate = vi.fn().mockReturnValue({ ok: false, errors: { name: "O nome precisa ter pelo menos 2 caracteres." } });
    render(<HabitForm onCreate={onCreate} />);

    await userEvent.click(screen.getByRole("button", { name: "Lançar planeta" }));

    expect(screen.getByRole("alert")).toHaveTextContent("pelo menos 2 caracteres");
    expect(screen.getByLabelText("Hábito")).toHaveAttribute("aria-invalid", "true");
  });

  it("ajusta a meta semanal e concorda o texto no singular", async () => {
    const onCreate = vi.fn().mockReturnValue({ ok: true, habit: {} });
    render(<HabitForm onCreate={onCreate} />);

    fireEvent.change(screen.getByRole("slider"), { target: { value: "1" } });
    expect(screen.getByText(/dia por semana/)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Hábito"), "Yoga");
    await userEvent.click(screen.getByRole("button", { name: "Lançar planeta" }));
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ weeklyTarget: 1 }));
  });
});
