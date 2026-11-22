export type Item = {
  id: number;
  title: string;
};

export const DEFAULT_LIMIT = 10;

export async function fetchItems(
  offset: number,
  limit: number = DEFAULT_LIMIT,
  signal?: AbortSignal,
): Promise<Item[]> {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  const res = await fetch(`/api/items?${params}`, { signal });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export type CursorRequest =
  | { type: "first" }
  | { type: "after"; cursor: number }
  | { type: "until"; cursor: number };

export type CursorPage = {
  items: Item[];
  nextCursor: number | null;
};

export async function fetchItemsByCursor(
  request: CursorRequest,
  signal?: AbortSignal,
): Promise<CursorPage> {
  const params = new URLSearchParams({ limit: String(DEFAULT_LIMIT) });
  if (request.type === "after") {
    params.set("after", String(request.cursor));
  }
  if (request.type === "until") {
    params.set("until", String(request.cursor));
  }
  const res = await fetch(`/api/cursor-items?${params}`, { signal });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function postItem(): Promise<Item> {
  const res = await fetch("/api/items", { method: "POST" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}
