import { expect, type Page, test } from "@playwright/test";

async function createPlanet(page: Page, name: string) {
  await page.getByLabel("Hábito", { exact: true }).fill(name);
  await page.getByRole("button", { name: "Lançar planeta" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-20T12:00:00-03:00"));
  await page.goto("/");
});

test("cria o primeiro planeta e mostra seus detalhes", async ({ page }) => {
  await expect(page.getByText("Seu céu ainda está vazio.", { exact: false })).toBeVisible();

  await createPlanet(page, "Estudar inglês");

  await expect(page.getByRole("complementary", { name: "Detalhes de Estudar inglês" })).toBeVisible();
  await expect(page.getByTestId("scene")).toHaveAttribute("data-planets", "1");
  await expect(page.getByTestId("done-today")).toHaveText("0/1");
});

test("exibe erro ao tentar criar um planeta sem nome", async ({ page }) => {
  await page.getByRole("button", { name: "Lançar planeta" }).click();

  await expect(page.getByRole("alert")).toHaveText("O nome precisa ter pelo menos 2 caracteres.");
  await expect(page.getByTestId("scene")).toHaveAttribute("data-planets", "0");
});

test("marca o check-in de hoje e atualiza a sequência", async ({ page }) => {
  await createPlanet(page, "Correr");

  const check = page.getByRole("button", { name: "Marcar Correr como feito hoje" });
  await check.click();

  await expect(check).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("done-today")).toHaveText("1/1");
  await expect(page.getByTestId("detail-streak")).toHaveText("1 dia");

  await page.getByRole("button", { name: "19 de novembro" }).click();
  await expect(page.getByTestId("detail-streak")).toHaveText("2 dias");
});

test("mantém os planetas depois de recarregar a página", async ({ page }) => {
  await createPlanet(page, "Meditar");
  await page.getByRole("button", { name: "Marcar Meditar como feito hoje" }).click();

  await page.reload();

  await expect(page.getByRole("button", { name: "Marcar Meditar como feito hoje" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("scene")).toHaveAttribute("data-planets", "1");
});

test("carrega o exemplo, busca e remove um planeta", async ({ page }) => {
  await page.getByRole("button", { name: "Carregar sistema de exemplo" }).click();
  await expect(page.getByTestId("scene")).toHaveAttribute("data-planets", "4");

  await page.getByRole("searchbox", { name: "Buscar planeta" }).fill("correr");
  await expect(page.locator(".habit")).toHaveCount(1);

  await page.locator(".habit__main").first().click();
  await page.getByRole("button", { name: "Remover planeta" }).click();
  await page.getByRole("button", { name: "Remover de vez" }).click();

  await expect(page.getByTestId("scene")).toHaveAttribute("data-planets", "3");
  await expect(page.getByText("Nenhum planeta com “correr”.")).toBeVisible();
});

test("renomeia um planeta pelo painel de detalhes", async ({ page }) => {
  await createPlanet(page, "Ler");

  await page.getByRole("button", { name: "Renomear" }).click();
  await page.getByLabel("Novo nome").fill("Ler 20 páginas");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("heading", { name: "Ler 20 páginas" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Marcar Ler 20 páginas como feito hoje" })).toBeVisible();
});

test("exporta o backup em JSON", async ({ page }) => {
  await createPlanet(page, "Desenhar");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("orbita-backup.json");
  await expect(page.getByText("Backup exportado.")).toBeVisible();
});
