import type { CSSProperties } from "react";
import type { DateKey } from "../domain/dates";
import type { Habit } from "../domain/habit";
import { orbitFor } from "../domain/orbit";

interface Props {
  habits: Habit[];
  today: DateKey;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CssOrrery({ habits, today, selectedId, onSelect }: Props) {
  return (
    <div className="scene scene--css" data-testid="scene" data-planets={habits.length}>
      <div className="orrery">
        <div className="orrery__sun" />
        {habits.map((habit, index) => {
          const orbit = orbitFor(habit, index, today);
          const style = {
            "--radius": `${orbit.radius * 2.6}rem`,
            "--duration": `${(40 / orbit.speed).toFixed(1)}s`,
            "--phase": `${orbit.phase}rad`,
            "--size": `${orbit.size * 2.4}rem`,
            "--planet": habit.color,
          } as CSSProperties;
          return (
            <div key={habit.id} className={`orrery__orbit${habit.id === selectedId ? " orrery__orbit--active" : ""}`} style={style}>
              <button
                type="button"
                className={`orrery__planet glyph--${habit.kind}`}
                aria-label={`Ver planeta ${habit.name}`}
                onClick={() => onSelect(habit.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
