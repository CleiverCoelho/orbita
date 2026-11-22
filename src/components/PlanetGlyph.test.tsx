import { render } from "@testing-library/react";
import { PlanetGlyph } from "./PlanetGlyph";

describe("miniatura de planeta", () => {
  it("aplica a classe do tipo de superfície e a cor como variável CSS", () => {
    const { container } = render(<PlanetGlyph color="#5eead4" kind="gelo" size={40} />);
    const glyph = container.querySelector("span")!;
    expect(glyph).toHaveClass("glyph", "glyph--gelo");
    expect(glyph.style.getPropertyValue("--planet")).toBe("#5eead4");
    expect(glyph.style.getPropertyValue("--size")).toBe("40px");
  });

  it("usa 28px como tamanho padrão", () => {
    const { container } = render(<PlanetGlyph color="#ff7a59" kind="lava" />);
    expect(container.querySelector("span")!.style.getPropertyValue("--size")).toBe("28px");
  });

  it("é decorativa e fica oculta para leitores de tela", () => {
    const { container } = render(<PlanetGlyph color="#ff7a59" kind="rochoso" />);
    expect(container.querySelector("span")).toHaveAttribute("aria-hidden", "true");
  });
});
