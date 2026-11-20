import { useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { IconArrowLeft } from '../components/Icons';
import { backupJson, decodeBackup, describe, encodeBackup } from '../lib/backup';
import { buildReminderIcs, parseTime } from '../lib/ics';
import type { Progress, Settings as SettingsT } from '../lib/progress';
import { playCorrect } from '../lib/sfx';

const APP_URL = 'https://joao-victor-alves-carvalho.github.io/miller-minute/';

/** Salva/compartilha um arquivo: usa a folha de compartilhar do celular quando existe. */
async function saveFile(name: string, type: string, content: string): Promise<void> {
  const file = new File([content], name, { type });
  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return;
    } catch {
      // cancelado: cai para o download
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: () => void }) {
  return (
    <button type="button" className="btn btn-ghost switch setting-toggle" role="switch" aria-checked={on} onClick={onChange}>
      {label} <span className="track" aria-hidden="true" />
    </button>
  );
}

function Choice<T extends number>({ value, options, onChange, suffix }: { value: T; options: T[]; onChange: (v: T) => void; suffix: string }) {
  return (
    <div className="choice-row" role="radiogroup">
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={o === value} className={`choice${o === value ? ' on' : ''}`} onClick={() => onChange(o)}>
          {o} {suffix}
        </button>
      ))}
    </div>
  );
}

export function Settings({ progress, setProgress, onBack }: { progress: Progress; setProgress: Dispatch<SetStateAction<Progress>>; onBack: () => void }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [pending, setPending] = useState<Progress | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const s = progress.settings;

  const set = (patch: Partial<SettingsT>) => setProgress((p) => ({ ...p, settings: { ...p.settings, ...patch } }));

  const flash = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 3500);
  };

  const copyCode = async () => {
    const code = encodeBackup(progress);
    try {
      await navigator.clipboard.writeText(code);
      flash('Código copiado! Guarde num lugar seguro (notas, e-mail para você mesmo).');
    } catch {
      setImportText(code);
      flash('Não consegui copiar sozinho: o código está na caixa abaixo, copie manualmente.');
    }
  };

  const tryImport = (text: string) => {
    const result = decodeBackup(text);
    if (!result.ok) {
      setImportError(result.error);
      setPending(null);
      return;
    }
    setImportError(null);
    setPending(result.progress);
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) tryImport(await file.text());
    e.target.value = '';
  };

  const time = parseTime(s.reminder) ? s.reminder : '20:00';

  return (
    <section className="screen" aria-label="Ajustes">
      <div className="topbar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar">
          <IconArrowLeft />
        </button>
        <h1 className="page-title">Ajustes</h1>
      </div>

      {msg && (
        <p className="flash" role="status">
          {msg}
        </p>
      )}

      <div className="settings-card glass">
        <p className="eyebrow">Áudio</p>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <Toggle label="Voz em inglês automática" on={s.autoAudio} onChange={() => set({ autoAudio: !s.autoAudio })} />
          <Toggle
            label="Sons de acerto e erro"
            on={s.sounds}
            onChange={() => {
              if (!s.sounds) playCorrect();
              set({ sounds: !s.sounds });
            }}
          />
        </div>
      </div>

      <div className="settings-card glass">
        <p className="eyebrow">Meta diária (Tempo de Miller)</p>
        <Choice value={s.goalMinutes} options={[5, 10, 15, 20, 30]} suffix="min" onChange={(v) => set({ goalMinutes: v })} />
        <p className="eyebrow" style={{ marginTop: 10 }}>
          Palavras novas por dia
        </p>
        <Choice value={s.newPerDay} options={[6, 12, 18, 24]} suffix="" onChange={(v) => set({ newPerDay: v })} />
      </div>

      <div className="settings-card glass">
        <p className="eyebrow">Lembrete diário</p>
        <p className="muted small">
          Cria um evento que se repete todo dia na agenda do celular, com alarme e o link do app. Para mudar o horário depois, edite ou apague o evento na própria agenda.
        </p>
        <div className="row">
          <label className="sr-only" htmlFor="reminder-time">
            Horário do lembrete
          </label>
          <input id="reminder-time" className="type-input time-input" type="time" value={time} onChange={(e) => set({ reminder: e.target.value })} />
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={async () => {
              await saveFile('lembrete-miller-minute.ics', 'text/calendar', buildReminderIcs(time, APP_URL, new Date()));
              flash('Abra o arquivo para adicionar o lembrete à sua agenda.');
            }}
          >
            📅 Adicionar à agenda
          </button>
        </div>
      </div>

      <div className="settings-card glass">
        <p className="eyebrow">Backup do progresso</p>
        <p className="muted small">
          Seu progresso fica só neste aparelho. Faça um backup para não perder (e para levar para outro celular). Hoje: {describe(progress)}.
        </p>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={copyCode}>
            📋 Copiar código
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ flex: 1 }}
            onClick={() => saveFile(`miller-minute-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json', backupJson(progress))}
          >
            💾 Salvar arquivo
          </button>
        </div>
        <p className="eyebrow" style={{ marginTop: 10 }}>
          Restaurar
        </p>
        <textarea
          className="type-input import-box"
          placeholder='Cole aqui o código que começa com "MM1."'
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          aria-label="Código do backup"
        />
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost" style={{ flex: 1 }} disabled={!importText.trim()} onClick={() => tryImport(importText)}>
            Usar código
          </button>
          <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => fileRef.current?.click()}>
            Abrir arquivo
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json,text/plain" hidden onChange={onFile} />
        </div>
        {importError && (
          <p className="chat-feedback" role="alert">
            {importError}
          </p>
        )}
        {pending && (
          <div className="confirm" role="alertdialog" aria-label="Confirmar restauração">
            <p style={{ margin: 0 }}>
              <strong>Backup encontrado:</strong> {describe(pending)}.
            </p>
            <p className="muted small" style={{ margin: 0 }}>
              Isso substitui o progresso atual deste aparelho ({describe(progress)}).
            </p>
            <div className="row">
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setPending(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setProgress(pending);
                  setPending(null);
                  setImportText('');
                  flash('Progresso restaurado!');
                }}
              >
                Restaurar
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="version">Miller Minute v{__APP_VERSION__}</p>
    </section>
  );
}
