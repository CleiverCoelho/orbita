import { lazy, Suspense, useMemo, useState } from "react";
import { CssOrrery } from "./components/CssOrrery";
import { HabitForm } from "./components/HabitForm";
import { HabitList } from "./components/HabitList";
import { PlanetDetail } from "./components/PlanetDetail";
import { SceneBoundary } from "./components/SceneBoundary";
import { TopBar } from "./components/TopBar";
import { toDateKey } from "./domain/dates";
import { overview } from "./domain/stats";
import { createRepository, type HabitRepository } from "./domain/storage";
import { useHabits } from "./hooks/useHabits";
import { prefersReducedMotion, supportsWebGL } from "./lib/webgl";

const SolarSystem = lazy(() => import("./scene/SolarSystem"));

interface Props {
  now?: () => Date;
  repository?: HabitRepository;
  webgl?: boolean;
}

export default function App({ now = () => new Date(), repository, webgl }: Props) {
  const today = toDateKey(now());
  const repo = useMemo(() => repository ?? createRepository(window.localStorage), [repository]);
  const useWebGL = useMemo(() => webgl ?? supportsWebGL(), [webgl]);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const [query, setQuery] = useState("");
  const store = useHabits(repo, today);
  const summary = overview(store.habits, today);
  const allDone = summary.total > 0 && summary.doneToday === summary.total;

  const fallback = (
    <CssOrrery habits={store.habits} today={today} selectedId={store.selected?.id ?? null} onSelect={store.select} />
  );

  return (
    <div className={`app${allDone ? " app--radiant" : ""}`}>
      {useWebGL ? (
        <SceneBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <SolarSystem
              habits={store.habits}
              today={today}
              selectedId={store.selected?.id ?? null}
              allDone={allDone}
              reducedMotion={reducedMotion}
              onSelect={store.select}
            />
          </Suspense>
        </SceneBoundary>
      ) : (
        fallback
      )}

      <TopBar summary={summary} onExport={store.exportBackup} onImport={store.importBackup} />

      <main className="layout">
        <div className="column column--left">
          <HabitList
            habits={store.habits}
            today={today}
            selectedId={store.selected?.id ?? null}
            query={query}
            onQueryChange={setQuery}
            onToggle={store.toggle}
            onSelect={store.select}
            onLoadSample={store.loadSample}
          />
          <section className="panel">
            <HabitForm onCreate={store.add} />
          </section>
        </div>

        <div className="column column--right">
          {store.selected ? (
            <PlanetDetail
              key={store.selected.id}
              habit={store.selected}
              today={today}
              onToggle={(day) => store.toggle(store.selected!.id, day)}
              onRename={(name) => store.rename(store.selected!.id, name)}
              onRemove={() => store.remove(store.selected!.id)}
              onClose={() => store.select(null)}
            />
          ) : (
            store.habits.length > 0 && (
              <p className="hint">Clique em um planeta ou no nome de um hábito para ver os detalhes. Arraste o céu para girar a câmera.</p>
            )
          )}
        </div>
      </main>
    </div>
  );
}
