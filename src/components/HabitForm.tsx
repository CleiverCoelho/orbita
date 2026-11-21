import { type FormEvent, useId, useState } from "react";
import { type HabitErrors, type HabitInput, NAME_MAX, PALETTE, PLANET_KINDS, type PlanetKind } from "../domain/habit";
import type { CreateResult } from "../domain/habit";
import { PlanetGlyph } from "./PlanetGlyph";

const KIND_LABELS: Record<PlanetKind, string> = {
  rochoso: "Rochoso",
  gasoso: "Gasoso",
  gelo: "Gelo",
  lava: "Lava",
};

const COLOR_NAMES: Record<string, string> = {
  "#ff7a59": "Coral",
  "#ffc857": "Âmbar",
  "#5eead4": "Água-marinha",
  "#8b7dff": "Lavanda",
  "#f472b6": "Rosa",
  "#60a5fa": "Azul",
};

interface Props {
  onCreate: (input: HabitInput) => CreateResult;
}

const EMPTY: HabitInput = { name: "", color: PALETTE[0], kind: "rochoso", weeklyTarget: 5 };

export function HabitForm({ onCreate }: Props) {
  const [input, setInput] = useState<HabitInput>(EMPTY);
  const [errors, setErrors] = useState<HabitErrors>({});
  const nameId = useId();
  const errorId = useId();

  function update<K extends keyof HabitInput>(key: K, value: HabitInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = onCreate(input);
    if (result.ok) {
      setInput({ ...EMPTY, color: input.color, kind: input.kind });
      setErrors({});
    } else {
      setErrors(result.errors);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} aria-label="Novo planeta" noValidate>
      <h2 className="panel__title">Novo planeta</h2>

      <div className="field">
        <label htmlFor={nameId}>Hábito</label>
        <input
          id={nameId}
          value={input.name}
          maxLength={NAME_MAX + 8}
          placeholder="Ex.: estudar inglês"
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? errorId : undefined}
          onChange={(event) => update("name", event.target.value)}
        />
        {errors.name && (
          <p className="field__error" id={errorId} role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <fieldset className="field">
        <legend>Cor</legend>
        <div className="swatches">
          {PALETTE.map((color) => (
            <label key={color} className="swatch" style={{ background: color }}>
              <input
                type="radio"
                name="color"
                value={color}
                checked={input.color === color}
                onChange={() => update("color", color)}
                aria-label={COLOR_NAMES[color]}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend>Superfície</legend>
        <div className="kinds">
          {PLANET_KINDS.map((kind) => (
            <label key={kind} className="kind">
              <input
                type="radio"
                name="kind"
                value={kind}
                checked={input.kind === kind}
                onChange={() => update("kind", kind)}
              />
              <PlanetGlyph color={input.color} kind={kind} size={22} />
              <span>{KIND_LABELS[kind]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor={`${nameId}-target`}>
          Meta: <output>{input.weeklyTarget}</output> {input.weeklyTarget === 1 ? "dia" : "dias"} por semana
        </label>
        <input
          id={`${nameId}-target`}
          type="range"
          min={1}
          max={7}
          value={input.weeklyTarget}
          onChange={(event) => update("weeklyTarget", Number(event.target.value))}
        />
      </div>

      <button type="submit" className="button button--sun">
        Lançar planeta
      </button>
    </form>
  );
}
