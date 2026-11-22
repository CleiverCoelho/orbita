import { type ChangeEvent, useRef, useState } from "react";
import type { Overview } from "../domain/stats";
import type { ParseResult } from "../domain/storage";
import { plural } from "../lib/format";

interface Props {
  summary: Overview;
  onExport: () => string;
  onImport: (raw: string) => ParseResult;
}

export function TopBar({ summary, onExport, onImport }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleExport() {
    const blob = new Blob([onExport()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orbita-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Backup exportado.");
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = onImport(await file.text());
    setMessage(result.ok ? `Backup importado: ${plural(result.habits.length, "planeta", "planetas")}.` : result.error);
    event.target.value = "";
  }

  const allDone = summary.total > 0 && summary.doneToday === summary.total;

  return (
    <header className="topbar">
      <div className="brand">
        <h1>Órbita</h1>
        <p>Seus hábitos em sistema solar</p>
      </div>

      <dl className="summary" aria-label="Resumo do dia">
        <div>
          <dt>Feitos hoje</dt>
          <dd data-testid="done-today" className={allDone ? "summary--all" : undefined}>
            {summary.doneToday}/{summary.total}
          </dd>
        </div>
        <div>
          <dt>Melhor sequência</dt>
          <dd>{plural(summary.bestStreak, "dia", "dias")}</dd>
        </div>
        <div>
          <dt>Energia solar</dt>
          <dd data-testid="energy">{summary.energy}</dd>
        </div>
      </dl>

      <div className="backup">
        <button type="button" className="button button--small button--ghost" onClick={handleExport} disabled={summary.total === 0}>
          Exportar
        </button>
        <button type="button" className="button button--small button--ghost" onClick={() => fileInput.current?.click()}>
          Importar
        </button>
        <input ref={fileInput} type="file" accept="application/json,.json" hidden aria-label="Arquivo de backup" onChange={handleImport} />
        {message && (
          <p className="backup__message" role="status">
            {message}
          </p>
        )}
      </div>
    </header>
  );
}
