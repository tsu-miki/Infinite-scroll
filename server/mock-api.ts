import type { Plugin } from "vite";
import { DEFAULT_LIMIT, type Item } from "../src/api";

// 新しい順（id の大きい順）に並べておく。カーソル方式はこの並び順を前提にしている
const ALL_ITEMS: Item[] = Array.from({ length: 10_000 }, (_, i) => {
  const id = 9_999 - i;
  return { id, title: `アイテム #${id}` };
});

let nextId = ALL_ITEMS.length;

// ローディング状態を目で確認できるよう、通信遅延を模している
const DELAY_MS = 800;

export function mockApi(): Plugin {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use("/api/cursor-items", async (req, res) => {
        const url = new URL(req.url ?? "", "http://localhost");
        const after = url.searchParams.get("after");
        const until = url.searchParams.get("until");
        const limit = Number(url.searchParams.get("limit") ?? DEFAULT_LIMIT);

        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

        // 新しい順に並んでいるので、「カーソルより後ろ」は「id がカーソルより小さい」になる
        const items =
          until !== null
            ? ALL_ITEMS.filter((item) => item.id >= Number(until))
            : ALL_ITEMS.filter(
                (item) => after === null || item.id < Number(after),
              ).slice(0, limit);

        const lastItem = items.at(-1);
        const hasMore =
          lastItem !== undefined &&
          ALL_ITEMS.some((item) => item.id < lastItem.id);
        const nextCursor = hasMore ? lastItem.id : null;

        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ items, nextCursor }));
      });

      server.middlewares.use("/api/items", async (req, res) => {
        if (req.method === "POST") {
          const item = { id: nextId, title: `新着 #${nextId}` };
          nextId++;
          ALL_ITEMS.unshift(item);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(item));
          return;
        }

        const url = new URL(req.url ?? "", "http://localhost");
        const offset = Number(url.searchParams.get("offset") ?? 0);
        const limit = Number(url.searchParams.get("limit") ?? DEFAULT_LIMIT);

        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

        const items = ALL_ITEMS.slice(offset, offset + limit);

        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(items));
      });
    },
  };
}
