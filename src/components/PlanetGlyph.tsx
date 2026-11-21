import type { CSSProperties } from "react";
import type { PlanetKind } from "../domain/habit";

interface Props {
  color: string;
  kind: PlanetKind;
  size?: number;
}

export function PlanetGlyph({ color, kind, size = 28 }: Props) {
  const style = { "--planet": color, "--size": `${size}px` } as CSSProperties;
  return <span className={`glyph glyph--${kind}`} style={style} aria-hidden="true" />;
}
