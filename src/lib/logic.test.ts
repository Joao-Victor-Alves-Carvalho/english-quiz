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
import { DAY, grade, isMastered, MAX_BOX, modeForBox, newCard, startOfDay, type CardState } from './srs';

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
    expect(modeForBox(0)).toBe('en-pt-choice');
    expect(modeForBox(2)).toBe('pt-en-choice');
    expect(modeForBox(4)).toBe('pt-en-type');
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
    expect(reviewStep?.mode).toBe('pt-en-choice');
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
