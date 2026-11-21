import { createId } from "./ids";
import { prefersReducedMotion, supportsWebGL } from "./webgl";

describe("utilitários do navegador", () => {
  it("detecta ausência de WebGL sem lançar erro", () => {
    expect(supportsWebGL()).toBe(false);
  });

  it("detecta WebGL quando o canvas fornece um contexto", () => {
    const fakeDocument = { createElement: () => ({ getContext: () => ({}) }) } as unknown as Document;
    expect(supportsWebGL(fakeDocument)).toBe(true);
  });

  it("trata falhas ao criar o canvas como ausência de WebGL", () => {
    const brokenDocument = {
      createElement: () => {
        throw new Error("sem canvas");
      },
    } as unknown as Document;
    expect(supportsWebGL(brokenDocument)).toBe(false);
  });

  it("respeita a preferência por movimento reduzido", () => {
    const reduced = { matchMedia: () => ({ matches: true }) } as unknown as Window;
    expect(prefersReducedMotion(reduced)).toBe(true);
    expect(prefersReducedMotion(undefined)).toBe(false);
  });

  it("gera ids diferentes a cada chamada", () => {
    expect(createId()).not.toBe(createId());
  });

  it("gera um id alternativo quando randomUUID não está disponível", () => {
    vi.stubGlobal("crypto", {});
    expect(createId(() => 0.5)).toMatch(/^h-[a-z0-9]+-[a-z0-9]+$/);
    vi.unstubAllGlobals();
  });
});
