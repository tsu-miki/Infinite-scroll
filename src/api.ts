export type Item = {
  id: number;
  title: string;
};

export const DEFAULT_VOLUME = 10;

export async function fetchItems(
  offset: number,
  volume: number = DEFAULT_VOLUME,
  signal?: AbortSignal,
): Promise<Item[]> {
  const params = new URLSearchParams({
    offset: String(offset),
    volume: String(volume),
  });
  const res = await fetch(`/api/items?${params}`, { signal });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}
