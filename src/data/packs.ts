import { pack1 } from './pack1';
import { pack2 } from './pack2';
import { themes } from './themes';
import type { Item, Pack } from './types';

/** Pacotes em ordem de desbloqueio. Novos pacotes entram no fim desta lista. */
export const packs: Pack[] = [pack1, pack2, ...themes];

export const itemsById: ReadonlyMap<string, Item> = new Map(
  packs.flatMap((pack) => pack.items.map((item) => [item.id, item] as const)),
);
