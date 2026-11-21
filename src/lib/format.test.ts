import { formatDay, plural } from "./format";

describe("formatação de textos", () => {
  it("escreve a data por extenso em português", () => {
    expect(formatDay("2026-11-20")).toBe("20 de novembro");
  });

  it("concorda o substantivo com a quantidade", () => {
    expect(plural(1, "dia", "dias")).toBe("1 dia");
    expect(plural(0, "dia", "dias")).toBe("0 dias");
    expect(plural(12, "dia", "dias")).toBe("12 dias");
  });
});
