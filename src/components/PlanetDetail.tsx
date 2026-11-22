import { type CSSProperties, type FormEvent, type PointerEvent, useState } from "react";
import { type DateKey, lastNDays } from "../domain/dates";
import { type Habit, isDoneOn } from "../domain/habit";
import { completionRate, formatPercent, weekProgress } from "../domain/stats";
import { currentStreak, levelFor, levelProgress, longestStreak } from "../domain/streak";
import { formatDay, plural } from "../lib/format";
import { PlanetGlyph } from "./PlanetGlyph";

interface Props {
  habit: Habit;
  today: DateKey;
  onToggle: (day: DateKey) => void;
  onRename: (name: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function PlanetDetail({ habit, today, onToggle, onRename, onRemove, onClose }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(habit.name);
  const [confirming, setConfirming] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const streak = currentStreak(habit.checkins, today);
  const level = levelFor(streak);
  const week = weekProgress(habit, today);
  const days = lastNDays(today, 14);

  function handleRename(event: FormEvent) {
    event.preventDefault();
    onRename(draft);
    setEditing(false);
  }

  function handlePointer(event: PointerEvent<HTMLElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    setTilt({
      x: ((event.clientY - box.top) / box.height - 0.5) * -8,
      y: ((event.clientX - box.left) / box.width - 0.5) * 10,
    });
  }

  const style = {
    "--planet": habit.color,
    "--tilt-x": `${tilt.x}deg`,
    "--tilt-y": `${tilt.y}deg`,
    "--progress": levelProgress(streak),
  } as CSSProperties;

  return (
    <aside
      className="panel detail"
      aria-label={`Detalhes de ${habit.name}`}
      style={style}
      onPointerMove={handlePointer}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <button type="button" className="detail__close" aria-label="Fechar detalhes" onClick={onClose}>
        ×
      </button>

      <div className="detail__hero">
        <PlanetGlyph color={habit.color} kind={habit.kind} size={64} />
        <div>
          {editing ? (
            <form className="rename" onSubmit={handleRename}>
              <input aria-label="Novo nome" value={draft} autoFocus onChange={(event) => setDraft(event.target.value)} />
              <button type="submit" className="button button--small">
                Salvar
              </button>
              <button type="button" className="button button--small button--ghost" onClick={() => setEditing(false)}>
                Cancelar
              </button>
            </form>
          ) : (
            <h2 className="detail__name">{habit.name}</h2>
          )}
          <p className="detail__level">{level.name}</p>
        </div>
      </div>

      <div className="level" role="progressbar" aria-label="Progresso até o próximo nível" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(levelProgress(streak) * 100)}>
        <span className="level__fill" />
      </div>
      <p className="level__hint">
        {level.next === null ? "Nível máximo: este hábito já brilha como uma estrela." : `Faltam ${plural(level.next - streak, "dia", "dias")} para o próximo nível.`}
      </p>

      <dl className="metrics">
        <div>
          <dt>Sequência atual</dt>
          <dd data-testid="detail-streak">{plural(streak, "dia", "dias")}</dd>
        </div>
        <div>
          <dt>Recorde</dt>
          <dd>{plural(longestStreak(habit.checkins), "dia", "dias")}</dd>
        </div>
        <div>
          <dt>Últimos 30 dias</dt>
          <dd>{formatPercent(completionRate(habit, today))}</dd>
        </div>
        <div>
          <dt>Nesta semana</dt>
          <dd className={week.met ? "metrics--met" : undefined}>
            {week.done} de {week.target}
          </dd>
        </div>
      </dl>

      <h3 className="detail__sub">Últimas duas semanas</h3>
      <div className="calendar">
        {days.map((day) => {
          const done = isDoneOn(habit, day);
          return (
            <button
              key={day}
              type="button"
              className={done ? "calendar__day calendar__day--done" : "calendar__day"}
              aria-pressed={done}
              aria-label={formatDay(day)}
              onClick={() => onToggle(day)}
            >
              {day.slice(8)}
            </button>
          );
        })}
      </div>

      <div className="detail__actions">
        {confirming ? (
          <>
            <span>Remover este planeta e todo o histórico?</span>
            <button type="button" className="button button--small button--danger" onClick={onRemove}>
              Remover de vez
            </button>
            <button type="button" className="button button--small button--ghost" onClick={() => setConfirming(false)}>
              Manter
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="button button--small button--ghost"
              onClick={() => {
                setDraft(habit.name);
                setEditing(true);
              }}
            >
              Renomear
            </button>
            <button type="button" className="button button--small button--ghost" onClick={() => setConfirming(true)}>
              Remover planeta
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
