import { DEFAULT_LIMIT, type Item } from "../shared/item";

export type ItemsRequest =
  | { type: "first" }
  | { type: "after"; cursor: number }
  | { type: "until"; cursor: number };

export type ItemsPage = {
  items: Item[];
  nextCursor: number | null;
};

export async function fetchItems(
  request: ItemsRequest,
  signal?: AbortSignal,
): Promise<ItemsPage> {
  const params = new URLSearchParams({ limit: String(DEFAULT_LIMIT) });
  if (request.type === "after") {
    params.set("after", String(request.cursor));
  }
  if (request.type === "until") {
    params.set("until", String(request.cursor));
  }
  const res = await fetch(`/api/cursor/items?${params}`, { signal });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}
