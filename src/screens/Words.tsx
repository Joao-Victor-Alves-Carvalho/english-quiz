import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import type { Item } from '../data/types';
import { IconArrowLeft } from '../components/Icons';
import { SpeakButton } from '../components/SpeakButton';
import { normalize } from '../lib/answer';
import type { Progress } from '../lib/progress';
import { MAX_BOX } from '../lib/srs';

export function Words({ items, progress, onBack }: { items: Item[]; progress: Progress; onBack: () => void }) {
  const [query, setQuery] = useState('');
  const [onlySeen, setOnlySeen] = useState(true);

  const list = useMemo(() => {
    const q = normalize(query);
    return items.filter((item) => {
      if (onlySeen && !progress.cards[item.id]) return false;
      if (!q) return true;
      return normalize(item.en).includes(q) || normalize(item.pt).includes(q);
    });
  }, [items, onlySeen, progress.cards, query]);

  return (
    <section className="screen" aria-label="Palavras">
      <div className="topbar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar">
          <IconArrowLeft />
        </button>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em', flex: 1 }}>Palavras</h1>
        <button type="button" className="btn btn-ghost switch" role="switch" aria-checked={!onlySeen} onClick={() => setOnlySeen(!onlySeen)} style={{ minHeight: 44, padding: '0 14px', fontSize: 14 }}>
          Todas <span className="track" aria-hidden="true" />
        </button>
      </div>
      <input className="type-input search" type="search" placeholder="Buscar em inglês ou português" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar palavra" />
      {list.length === 0 && <p className="muted">{onlySeen && !query ? 'Você ainda não viu nenhuma palavra. Comece uma sessão!' : 'Nada encontrado.'}</p>}
      <ul className="word-list">
        {list.map((item, i) => {
          const box = progress.cards[item.id]?.box ?? 0;
          return (
            <motion.li key={item.id} className="word-row" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.025 }}>
              <div className="texts">
                <strong>{item.en}</strong>
                <span>{item.pt}</span>
              </div>
              <div className="dots" aria-label={`Nível ${box} de ${MAX_BOX}`}>
                {Array.from({ length: MAX_BOX }, (_, d) => (
                  <i key={d} className={d < box ? 'on' : ''} />
                ))}
              </div>
              <SpeakButton text={item.en} size="small" />
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
