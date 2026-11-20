import { pack1 } from './pack1';
import type { Item, Pack } from './types';

/** Pacotes em ordem de desbloqueio. Novos pacotes entram no fim desta lista. */
export const packs: Pack[] = [pack1];

export const itemsById: ReadonlyMap<string, Item> = new Map(
  packs.flatMap((pack) => pack.items.map((item) => [item.id, item] as const)),
);
