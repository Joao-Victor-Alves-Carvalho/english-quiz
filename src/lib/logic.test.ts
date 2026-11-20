import { describe, expect, it } from 'vitest';
import { packs } from '../data/packs';
import { pack1 } from '../data/pack1';
import type { Item, Pack } from '../data/types';
import { checkTyped, normalize } from './answer';
import { buildChoices } from './choices';
import {
  currentStreak,
  emptyProgress,
  newAllowedToday,
  registerNewItems,
  registerStudyDay,
  unlockedPacks,
} from './progress';
import { buildSession, dueItems, scheduleRetry, unseenItems, type Step } from './session';
import { DAY, grade, isMastered, MAX_BOX, newCard, startOfDay, type CardState } from './srs';
import { answerField, clozeParts, modeFor, resolveMode } from './modes';
import { matchSpoken } from './answer';
import { explain } from './explain';
import { notes } from '../data/notes';
import { capabilities, pause, pausedMinutes, recordAnswer, resume } from './progress';

/** Gerador pseudoaleatório determinístico para os testes. */
function seeded(seed = 42): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const NOW = new Date(2026, 10, 20, 20, 0, 0).getTime();

describe('conteúdo', () => {
  const all = packs.flatMap((p) => p.items);

  it('o pacote 1 tem 300+ itens', () => {
    expect(pack1.items.length).toBeGreaterThanOrEqual(300);
    expect(pack1.items.length).toBeLessThanOrEqual(400);
  });

  it('ids, textos em inglês e traduções são únicos', () => {
    expect(new Set(all.map((i) => i.id)).size).toBe(all.length);
    expect(new Set(all.map((i) => i.en.toLowerCase())).size).toBe(all.length);
    expect(new Set(all.map((i) => i.pt.toLowerCase())).size).toBe(all.length);
  });

  it('exemplo e tradução do exemplo andam juntos', () => {
    for (const item of all) {
      expect(Boolean(item.ex), item.en).toBe(Boolean(item.exPt));
    }
  });
});

describe('Leitner', () => {
  it('acerto sobe a caixa e agenda pelo início do dia', () => {
    const card = grade(newCard(NOW), true, NOW);
    expect(card.box).toBe(1);
    expect(card.due).toBe(startOfDay(NOW) + DAY);
  });

  it('erro desce uma caixa e deixa o item pendente na hora', () => {
    const card: CardState = { box: 3, due: NOW, correct: 3, wrong: 0, lastSeen: NOW };
    const after = grade(card, false, NOW);
    expect(after.box).toBe(2);
    expect(after.due).toBe(NOW);
    expect(grade(newCard(NOW), false, NOW).box).toBe(0);
  });

  it('a caixa não passa do máximo', () => {
    let card = newCard(NOW);
    for (let i = 0; i < 20; i++) card = grade(card, true, NOW);
    expect(card.box).toBe(MAX_BOX);
    expect(isMastered(card)).toBe(true);
  });

  it('o tipo de pergunta evolui com a caixa', () => {
    const item = pack1.items.find((i) => i.en === 'remember')!;
    expect(modeFor(0, 0, item)).toBe('en-pt-choice');
    expect(modeFor(0, 2, item)).toBe('listen-choice');
    expect(modeFor(2, 0, item)).toBe('pt-en-choice');
    expect(modeFor(2, 1, item)).toBe('cloze-choice');
    expect(modeFor(2, 3, item)).toBe('speak');
    expect(modeFor(4, 0, item)).toBe('pt-en-type');
  });
});

describe('sessão', () => {
  const items = pack1.items.slice(0, 30);

  it('item novo é apresentado antes de ser perguntado', () => {
    const steps = buildSession([], items.slice(0, 4), {}, seeded());
    for (const item of items.slice(0, 4)) {
      const intro = steps.findIndex((s) => s.itemId === item.id && s.kind === 'intro');
      const quiz = steps.findIndex((s) => s.itemId === item.id && s.kind === 'quiz' && s.graded);
      expect(intro).toBeGreaterThanOrEqual(0);
      expect(quiz).toBeGreaterThan(intro);
    }
  });

  it('cada item é avaliado uma vez e os novos repetem na fixação', () => {
    const cards: Record<string, CardState> = {};
    const reviews = items.slice(10, 18);
    for (const r of reviews) cards[r.id] = { ...newCard(NOW - DAY), box: 2, due: NOW - 1 };
    const fresh = items.slice(0, 5);
    const steps = buildSession(reviews, fresh, cards, seeded());
    const graded = steps.filter((s) => s.graded).map((s) => s.itemId);
    expect(new Set(graded).size).toBe(graded.length);
    expect(graded.length).toBe(reviews.length + fresh.length);
    const practice = steps.filter((s) => s.kind === 'quiz' && !s.graded);
    expect(practice.map((s) => s.itemId).sort()).toEqual(fresh.map((f) => f.id).sort());
    const reviewStep = steps.find((s) => s.itemId === reviews[0]?.id);
    expect(['pt-en-choice', 'cloze-choice', 'listen-choice', 'speak']).toContain(reviewStep?.mode);
  });

  it('respeita os limites de revisões e de novos', () => {
    const steps = buildSession(items, items, {}, seeded(), { maxReviews: 5, maxNew: 3, newGap: 2 });
    expect(steps.filter((s) => s.kind === 'intro')).toHaveLength(3);
  });

  it('erro reagenda o item alguns passos depois, sem avaliar de novo', () => {
    const queue: Step[] = items.slice(0, 6).map((i) => ({ itemId: i.id, kind: 'quiz', graded: true, mode: 'en-pt-choice' }));
    const current = queue[1] as Step;
    const next = scheduleRetry(queue, 1, current);
    expect(next).toHaveLength(7);
    expect(next[5]).toEqual({ ...current, graded: false });
    expect(scheduleRetry(queue, 5, current)[6]?.itemId).toBe(current.itemId);
  });

  it('separa pendentes e nunca vistos', () => {
    const cards: Record<string, CardState> = {
      [items[0]!.id]: { ...newCard(NOW), due: NOW - 10 },
      [items[1]!.id]: { ...newCard(NOW), due: NOW + DAY },
    };
    expect(dueItems(items, cards, NOW).map((i) => i.id)).toEqual([items[0]!.id]);
    expect(unseenItems(items, cards)).toHaveLength(items.length - 2);
  });
});

describe('alternativas', () => {
  it('4 opções distintas incluindo a resposta, da mesma classe quando dá', () => {
    const verbs = pack1.items.filter((i) => i.pos === 'verbo');
    const target = verbs[0] as Item;
    for (let seed = 1; seed < 20; seed++) {
      const choices = buildChoices(target, pack1.items, seeded(seed), 'pt');
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices).toContain(target.pt);
      const ptVerbs = new Set(verbs.map((v) => v.pt));
      expect(choices.every((c) => ptVerbs.has(c))).toBe(true);
    }
  });

  it('completa com outras classes se faltar item da mesma', () => {
    const pool = [pack1.items[0]!, ...pack1.items.filter((i) => i.pos === 'verbo').slice(0, 10)];
    const choices = buildChoices(pool[0]!, pool, seeded(), 'en');
    expect(choices).toHaveLength(4);
  });
});

describe('resposta digitada', () => {
  it('ignora maiúsculas, acentos, pontuação e apóstrofo', () => {
    expect(normalize("  I'm FINE, thanks! ")).toBe('im fine thanks');
    expect(checkTyped('im fine thanks', "I'm fine, thanks")).toBe('exact');
  });

  it('aceita 1 letra errada em palavras de 5+ letras', () => {
    expect(checkTyped('remenber', 'remember')).toBe('typo');
    expect(checkTyped('ct', 'cat')).toBe('wrong');
    expect(checkTyped('', 'cat')).toBe('wrong');
    expect(checkTyped('dog', 'cat')).toBe('wrong');
  });
});

describe('progresso', () => {
  it('sequência de dias cresce, mantém no dia seguinte e zera se pular', () => {
    let p = registerStudyDay(emptyProgress(), NOW);
    expect(p.streak).toBe(1);
    expect(registerStudyDay(p, NOW).streak).toBe(1);
    p = registerStudyDay(p, NOW + DAY);
    expect(p.streak).toBe(2);
    expect(currentStreak(p, NOW + DAY * 2)).toBe(2);
    expect(currentStreak(p, NOW + DAY * 3)).toBe(0);
  });

  it('limite diário de itens novos', () => {
    const p = registerNewItems(emptyProgress(), NOW, 5);
    expect(newAllowedToday(p, NOW)).toBe(7);
    expect(newAllowedToday(p, NOW + DAY)).toBe(12);
  });

  it('libera o próximo pacote com 80% dominado', () => {
    const mk = (id: string): Pack => ({
      id,
      title: id,
      subtitle: '',
      items: Array.from({ length: 10 }, (_, i) => ({ id: `${id}:${i}`, en: `${id}${i}`, pt: `${id}${i}`, pos: 'verbo' as const })),
    });
    const a = mk('a');
    const b = mk('b');
    const cards: Record<string, CardState> = {};
    expect(unlockedPacks([a, b], cards)).toHaveLength(1);
    for (let i = 0; i < 8; i++) cards[`a:${i}`] = { ...newCard(NOW), box: 4 };
    expect(unlockedPacks([a, b], cards)).toHaveLength(2);
  });
});

describe('tipos de pergunta', () => {
  const remember = pack1.items.find((i) => i.en === 'remember')!;
  const hello = pack1.items.find((i) => i.en === 'Hello')!;

  it('monta a lacuna a partir do exemplo', () => {
    expect(clozeParts(remember)).toEqual({ before: 'I ', answer: 'remember', after: ' you.' });
    expect(clozeParts(hello)).toBeNull(); // frase pronta não vira lacuna
    const won = pack1.items.find((i) => i.en === 'win')!; // exemplo usa "won", não serve
    expect(clozeParts(won)).toBeNull();
    expect(modeFor(2, 1, won)).toBe('pt-en-choice');
    expect(modeFor(4, 1, won)).toBe('pt-en-type');
  });

  it('boa parte do pacote tem lacuna possível', () => {
    const ok = pack1.items.filter((i) => clozeParts(i)).length;
    expect(ok).toBeGreaterThan(200);
  });

  it('esconde áudio e microfone quando pausados', () => {
    expect(resolveMode('listen-choice', remember, { audio: false, mic: true })).toBe('en-pt-choice');
    expect(resolveMode('speak', remember, { audio: true, mic: false })).toBe('pt-en-choice');
    expect(resolveMode('speak', remember, { audio: true, mic: true })).toBe('speak');
    expect(answerField('listen-choice')).toBe('pt');
    expect(answerField('cloze-choice')).toBe('en');
  });

  it('pausa por 15 minutos e reativa', () => {
    const support = { speech: true, recognition: true };
    let p = pause(emptyProgress(), 'mic', NOW);
    expect(pausedMinutes(p, 'mic', NOW)).toBe(15);
    expect(capabilities(p, NOW + 14 * 60_000, support)).toEqual({ audio: true, mic: false });
    expect(capabilities(p, NOW + 15 * 60_000, support)).toEqual({ audio: true, mic: true });
    p = resume(p, 'mic');
    expect(capabilities(p, NOW, support).mic).toBe(true);
    expect(capabilities(emptyProgress(), NOW, { speech: false, recognition: false })).toEqual({ audio: false, mic: false });
  });
});

describe('resposta falada', () => {
  it('aceita igual, com pontuação, número em dígito ou dentro da frase', () => {
    expect(matchSpoken(['Remember'], 'remember')).toBe(true);
    expect(matchSpoken(['i am fine thanks'], "I'm fine, thanks")).toBe(true); // sem contração também vale
    expect(matchSpoken(["I'm fine, thanks."], "I'm fine, thanks")).toBe(true);
    expect(matchSpoken(['2'], 'two')).toBe(true);
    expect(matchSpoken(['the kitchen'], 'kitchen')).toBe(true);
    expect(matchSpoken(['remembers'], 'remember')).toBe(true);
    expect(matchSpoken(['dog', 'cat'], 'cat')).toBe(true);
    expect(matchSpoken(['dog'], 'cat')).toBe(false);
    expect(matchSpoken([], 'cat')).toBe(false);
  });
});

describe('explicação do erro', () => {
  const pool = pack1.items;
  const make = pool.find((i) => i.en === 'make')!;
  const doItem = pool.find((i) => i.en === 'do')!;

  it('diz a resposta certa, o que foi marcado e a dica', () => {
    const lines = explain({ item: make, mode: 'pt-en-choice', chosen: 'do', pool, notes });
    expect(lines[0]).toContain('"make"');
    expect(lines.some((l) => l.includes('"do" significa'))).toBe(true);
    expect(lines.some((l) => l.includes('criar ou produzir'))).toBe(true);
  });

  it('explica a escolha em português e a lacuna', () => {
    const lines = explain({ item: doItem, mode: 'en-pt-choice', chosen: make.pt, pool, notes });
    expect(lines.some((l) => l.includes('tradução de "make"'))).toBe(true);
    const remember = pool.find((i) => i.en === 'remember')!;
    const cloze = explain({ item: remember, mode: 'cloze-choice', chosen: 'forget', pool, notes });
    expect(cloze.some((l) => l.includes('Eu me lembro de você'))).toBe(true);
  });

  it('todas as dicas apontam para palavras do pacote', () => {
    const ens = new Set(pool.map((i) => i.en.toLowerCase()));
    for (const key of Object.keys(notes)) expect(ens.has(key), key).toBe(true);
  });
});

describe('histórico', () => {
  it('soma respostas no dia', () => {
    let p = recordAnswer(emptyProgress(), NOW, true);
    p = recordAnswer(p, NOW, false);
    p = registerNewItems(p, NOW, 2);
    const day = Object.values(p.history)[0];
    expect(day).toEqual({ answers: 2, correct: 1, newItems: 2 });
    expect(p.totalAnswers).toBe(2);
  });
});

describe('situações (chat)', () => {
  it('roteiros válidos: ids únicos, opções com resposta certa e explicação nas erradas', async () => {
    const { situations } = await import('../data/situations');
    const { tokens: toks } = await import('./chat');
    expect(new Set(situations.map((s) => s.id)).size).toBe(situations.length);
    expect(situations[0]?.unlockAt).toBe(0);
    for (let i = 1; i < situations.length; i++) {
      expect(situations[i]!.unlockAt).toBeGreaterThanOrEqual(situations[i - 1]!.unlockAt);
    }
    for (const s of situations) {
      expect(s.steps.at(-1)?.kind, s.id).toBeDefined();
      for (const step of s.steps) {
        if (step.kind === 'choose') {
          expect(step.options.length, `${s.id}: ${step.goal}`).toBeGreaterThanOrEqual(2);
          expect(step.options.some((o) => o.ok), `${s.id}: ${step.goal}`).toBe(true);
          expect(new Set(step.options.map((o) => o.text)).size).toBe(step.options.length);
          for (const o of step.options) if (!o.ok) expect(o.why, `${s.id}: ${o.text}`).toBeTruthy();
        }
        if (step.kind === 'build') {
          const words = toks(step.text);
          expect(words.length, step.text).toBeGreaterThanOrEqual(2);
          // Palavras extras não podem ser da frase (senão a montagem fica ambígua).
          for (const extra of step.extra) expect(words, `${s.id}: ${extra}`).not.toContain(extra);
        }
      }
    }
  });

  it('monta a frase ignorando pontuação e maiúsculas', async () => {
    const { checkBuild, tokens: toks, explainBuild } = await import('./chat');
    expect(toks("I'd like the chicken, please.")).toEqual(["I'd", 'like', 'the', 'chicken', 'please']);
    expect(checkBuild(['A', 'table', 'for', 'two', 'please'], 'A table for two, please.')).toBe(true);
    expect(checkBuild(['A', 'table', 'two', 'for', 'please'], 'A table for two, please.')).toBe(false);
    const step = { kind: 'build' as const, goal: '', text: 'A table for two, please.', pt: 'Uma mesa para dois.', extra: ['to'] };
    expect(explainBuild(['A', 'table', 'to', 'two', 'please'], step)).toContain('"to" não entra');
    expect(explainBuild(['table', 'A', 'for', 'two', 'please'], step)).toContain('a ordem não');
    expect(explainBuild(['A', 'table'], step)).toContain('Faltou palavra');
  });

  it('estrelas, liberação e registro', async () => {
    const { stars: st, isUnlocked: unlocked, phrasesOf } = await import('./chat');
    const { situations } = await import('../data/situations');
    const { completeSituation } = await import('./progress');
    expect(st(0)).toBe(3);
    expect(st(2)).toBe(2);
    expect(st(5)).toBe(1);
    const hotel = situations.find((s) => s.id === 'hotel')!;
    expect(unlocked(hotel, hotel.unlockAt - 1)).toBe(false);
    expect(unlocked(hotel, hotel.unlockAt)).toBe(true);
    expect(phrasesOf(hotel).length).toBeGreaterThan(3);
    let p = completeSituation(emptyProgress(), 'hotel', 2, NOW);
    p = completeSituation(p, 'hotel', 3, NOW);
    p = completeSituation(p, 'hotel', 1, NOW);
    expect(p.situations.hotel).toEqual({ done: 3, best: 3 });
    expect(p.streak).toBe(1);
  });
});
