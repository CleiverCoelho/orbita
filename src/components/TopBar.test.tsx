import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopBar } from "./TopBar";

const summary = { total: 2, doneToday: 2, bestStreak: 1, averageRate: 1, energy: 30 };

describe("barra superior", () => {
  it("resume o dia e destaca quando todos os hábitos foram feitos", () => {
    render(<TopBar summary={summary} onExport={vi.fn()} onImport={vi.fn()} />);
    expect(screen.getByTestId("done-today")).toHaveTextContent("2/2");
    expect(screen.getByTestId("done-today")).toHaveClass("summary--all");
    expect(screen.getByText("1 dia")).toBeInTheDocument();
  });

  it("desabilita a exportação quando não há hábitos", () => {
    render(<TopBar summary={{ ...summary, total: 0, doneToday: 0 }} onExport={vi.fn()} onImport={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Exportar" })).toBeDisabled();
  });

  it("baixa um arquivo JSON com o backup", async () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:backup");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const onExport = vi.fn().mockReturnValue("{}");

    render(<TopBar summary={summary} onExport={onExport} onImport={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Exportar" }));

    expect(onExport).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:backup");
    expect(screen.getByRole("status")).toHaveTextContent("Backup exportado.");
    vi.unstubAllGlobals();
    click.mockRestore();
  });

  it("importa um arquivo e informa quantos planetas chegaram", async () => {
    const onImport = vi.fn().mockReturnValue({ ok: true, habits: [{}, {}, {}] });
    render(<TopBar summary={summary} onExport={vi.fn()} onImport={onImport} />);

    const file = new File(['{"habits":[]}'], "backup.json", { type: "application/json" });
    await userEvent.upload(screen.getByLabelText("Arquivo de backup"), file);

    expect(onImport).toHaveBeenCalledWith('{"habits":[]}');
    expect(await screen.findByRole("status")).toHaveTextContent("Backup importado: 3 planetas.");
  });

  it("mostra o motivo quando o arquivo importado é inválido", async () => {
    const onImport = vi.fn().mockReturnValue({ ok: false, error: "O arquivo não é um JSON válido." });
    render(<TopBar summary={summary} onExport={vi.fn()} onImport={onImport} />);

    await userEvent.upload(screen.getByLabelText("Arquivo de backup"), new File(["x"], "x.json", { type: "application/json" }));

    expect(await screen.findByRole("status")).toHaveTextContent("O arquivo não é um JSON válido.");
  });
});
