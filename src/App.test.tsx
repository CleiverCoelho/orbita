import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import type { Habit } from "./domain/habit";
import { createRepository, type HabitRepository, STORAGE_KEY } from "./domain/storage";

const now = () => new Date(2026, 10, 20, 9, 0);

function memoryRepository(initial: Habit[] = []): HabitRepository & { saved: Habit[] } {
  const repository = {
    saved: initial,
    load: () => initial,
    save(habits: Habit[]) {
      repository.saved = habits;
    },
  };
  return repository;
}

async function createPlanet(name: string) {
  await userEvent.type(screen.getByLabelText("Hábito"), name);
  await userEvent.click(screen.getByRole("button", { name: "Lançar planeta" }));
}

describe("aplicação Órbita", () => {
  it("cria um planeta, abre seus detalhes e salva no repositório", async () => {
    const repository = memoryRepository();
    render(<App now={now} repository={repository} webgl={false} />);

    await createPlanet("Estudar inglês");

    expect(screen.getByRole("complementary", { name: "Detalhes de Estudar inglês" })).toBeInTheDocument();
    expect(screen.getByTestId("scene")).toHaveAttribute("data-planets", "1");
    expect(repository.saved.map((habit) => habit.name)).toEqual(["Estudar inglês"]);
  });

  it("impede criar dois planetas com o mesmo nome", async () => {
    render(<App now={now} repository={memoryRepository()} webgl={false} />);
    await createPlanet("Ler");
    await createPlanet("ler");
    expect(screen.getByRole("alert")).toHaveTextContent("Já existe um planeta com esse nome.");
  });

  it("atualiza o resumo do dia ao fazer o check-in", async () => {
    render(<App now={now} repository={memoryRepository()} webgl={false} />);
    await createPlanet("Correr");

    await userEvent.click(screen.getByRole("button", { name: "Marcar Correr como feito hoje" }));

    expect(screen.getByTestId("done-today")).toHaveTextContent("1/1");
    expect(screen.getByTestId("detail-streak")).toHaveTextContent("1 dia");
  });

  it("carrega o sistema de exemplo e remove um planeta", async () => {
    render(<App now={now} repository={memoryRepository()} webgl={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Carregar sistema de exemplo" }));
    expect(screen.getByTestId("scene")).toHaveAttribute("data-planets", "4");

    await userEvent.click(screen.getByRole("button", { name: "Ver planeta Correr 5 km" }));
    await userEvent.click(screen.getByRole("button", { name: "Remover planeta" }));
    await userEvent.click(screen.getByRole("button", { name: "Remover de vez" }));

    expect(screen.getByTestId("scene")).toHaveAttribute("data-planets", "3");
    expect(screen.getByText(/Clique em um planeta/)).toBeInTheDocument();
  });

  it("renomeia e marca dias anteriores pelo painel de detalhes", async () => {
    render(<App now={now} repository={memoryRepository()} webgl={false} />);
    await createPlanet("Nadar");

    await userEvent.click(screen.getByRole("button", { name: "19 de novembro" }));
    await userEvent.click(screen.getByRole("button", { name: "Renomear" }));
    await userEvent.clear(screen.getByLabelText("Novo nome"));
    await userEvent.type(screen.getByLabelText("Novo nome"), "Nadar 1 km{Enter}");

    expect(screen.getByRole("heading", { name: "Nadar 1 km" })).toBeInTheDocument();
    expect(screen.getByTestId("detail-streak")).toHaveTextContent("1 dia");

    await userEvent.click(screen.getByRole("button", { name: "Fechar detalhes" }));
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("fecha os detalhes do planeta com a tecla Esc", async () => {
    render(<App now={now} repository={memoryRepository()} webgl={false} />);
    await createPlanet("Pintar");
    expect(screen.getByRole("complementary")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("importa um backup substituindo os planetas atuais", async () => {
    render(<App now={now} repository={memoryRepository()} webgl={false} />);
    const backup = JSON.stringify([
      { id: "x", name: "Desenhar", color: "#f472b6", kind: "rochoso", weeklyTarget: 2, createdAt: "2026-11-01", checkins: [] },
    ]);

    await userEvent.upload(screen.getByLabelText("Arquivo de backup"), new File([backup], "b.json", { type: "application/json" }));

    expect(await screen.findByText("Backup importado: 1 planeta.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Marcar Desenhar como feito hoje" })).toBeInTheDocument();
  });

  it("usa o localStorage por padrão e recupera os dados ao recarregar", async () => {
    const { unmount } = render(<App now={now} webgl={false} />);
    await createPlanet("Escrever");
    unmount();

    expect(window.localStorage.getItem(STORAGE_KEY)).toContain("Escrever");
    expect(createRepository(window.localStorage).load()).toHaveLength(1);

    render(<App now={now} webgl={false} />);
    expect(screen.getByRole("button", { name: "Marcar Escrever como feito hoje" })).toBeInTheDocument();
  });

  it("mostra o planetário alternativo enquanto a cena 3D carrega", () => {
    render(<App now={now} repository={memoryRepository()} webgl />);
    expect(screen.getByTestId("scene")).toHaveClass("scene--css");
  });
});
