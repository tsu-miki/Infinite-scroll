export type Item = {
  id: number;
  title: string;
};

export const DEFAULT_VOLUME = 10;
const TOTAL = 100;
// ローディング状態を目で確認できるよう、通信遅延を模している
const DELAY_MS = 800;

export async function fetchItems(
  offset: number,
  volume: number = DEFAULT_VOLUME,
): Promise<Item[]> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  const end = Math.min(offset + volume, TOTAL);
  const items: Item[] = [];
  for (let i = offset; i < end; i++) {
    items.push({ id: i, title: `アイテム #${i}` });
  }
  return items;
}
