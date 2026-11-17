// 記事の「バックエンドの API 定義」に相当するモック。
// offset 番目から volume 件を返す、ごく普通の Offset-based pagination。
// 本物のサーバーの代わりに、ブラウザ内で遅延付きのダミーデータを返す。

export type Item = {
  id: number;
  title: string;
};

export const DEFAULT_VOLUME = 10;
const TOTAL = 100; // 全件数（ダミー）
const DELAY_MS = 800; // ローディング状態を目で見るための通信遅延

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
