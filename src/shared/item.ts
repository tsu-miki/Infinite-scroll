export type Item = {
  id: number;
  title: string;
};

export const DEFAULT_LIMIT = 10;

export async function postItem(): Promise<Item> {
  const res = await fetch("/api/items", { method: "POST" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteFirstItem(): Promise<Item | null> {
  const res = await fetch("/api/items", { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}
