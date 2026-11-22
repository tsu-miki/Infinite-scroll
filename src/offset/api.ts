import { DEFAULT_LIMIT, type Item } from "../shared/item";

export async function fetchItems(
  offset: number,
  limit: number = DEFAULT_LIMIT,
  signal?: AbortSignal,
): Promise<Item[]> {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  const res = await fetch(`/api/offset/items?${params}`, { signal });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}
