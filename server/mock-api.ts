import type { Plugin } from "vite";
import { DEFAULT_LIMIT, type Item } from "../src/api";

const ALL_ITEMS: Item[] = Array.from({ length: 100 }, (_, id) => ({
  id,
  title: `アイテム #${id}`,
}));

// ローディング状態を目で確認できるよう、通信遅延を模している
const DELAY_MS = 800;

export function mockApi(): Plugin {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use("/api/items", async (req, res) => {
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
