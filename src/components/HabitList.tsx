import type { CSSProperties } from "react";
import { type DateKey, lastNDays, weekdayInitial } from "../domain/dates";
import { type Habit, isDoneOn } from "../domain/habit";
import { currentStreak } from "../domain/streak";
import { formatDay, plural } from "../lib/format";
import { PlanetGlyph } from "./PlanetGlyph";

interface Props {
  habits: Habit[];
  today: DateKey;
  selectedId: string | null;
  query: string;
  onQueryChange: (query: string) => void;
  onToggle: (id: string, day: DateKey) => void;
  onSelect: (id: string) => void;
  onLoadSample: () => void;
}

export function HabitList({ habits, today, selectedId, query, onQueryChange, onToggle, onSelect, onLoadSample }: Props) {
  const week = lastNDays(today, 7);
  const term = query.trim().toLowerCase();
  const visible = term ? habits.filter((habit) => habit.name.toLowerCase().includes(term)) : habits;

  if (habits.length === 0) {
    return (
      <section className="panel list" aria-label="Hábitos de hoje">
        <h2 className="panel__title">Hoje</h2>
        <div className="empty">
          <p>Seu céu ainda está vazio. Cada hábito que você criar vira um planeta, e ele cresce enquanto a sequência durar.</p>
          <button type="button" className="button button--ghost" onClick={onLoadSample}>
            Carregar sistema de exemplo
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel list" aria-label="Hábitos de hoje">
      <div className="list__head">
        <h2 className="panel__title">Hoje</h2>
        <span className="list__date">{formatDay(today)}</span>
      </div>
      <input
        className="search"
        type="search"
        placeholder="Buscar planeta"
        aria-label="Buscar planeta"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      {visible.length === 0 ? (
        <p className="list__none">Nenhum planeta com “{query.trim()}”.</p>
      ) : (
        <ul className="habits">
          {visible.map((habit) => {
            const done = isDoneOn(habit, today);
            const streak = currentStreak(habit.checkins, today);
            return (
              <li key={habit.id} className={`habit${habit.id === selectedId ? " habit--selected" : ""}`}>
                <button
                  type="button"
                  className={`check${done ? " check--done" : ""}`}
                  style={{ "--planet": habit.color } as CSSProperties}
                  aria-pressed={done}
                  aria-label={`Marcar ${habit.name} como feito hoje`}
                  onClick={() => onToggle(habit.id, today)}
                >
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M5 10.5l3.2 3.2L15 7" />
                  </svg>
                </button>
                <button type="button" className="habit__main" onClick={() => onSelect(habit.id)}>
                  <PlanetGlyph color={habit.color} kind={habit.kind} size={18} />
                  <span className="habit__name">{habit.name}</span>
                  <span className="habit__streak" data-testid="streak">
                    {plural(streak, "dia", "dias")}
                  </span>
                </button>
                <ol className="week" aria-label={`Últimos 7 dias de ${habit.name}`}>
                  {week.map((day) => (
                    <li
                      key={day}
                      className={isDoneOn(habit, day) ? "week__day week__day--done" : "week__day"}
                      style={{ "--planet": habit.color } as CSSProperties}
                      title={formatDay(day)}
                    >
                      {weekdayInitial(day)}
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
