import type { Plugin } from "vite";
import type { Item } from "../src/api";

const TOTAL = 100;
// ローディング状態を目で確認できるよう、通信遅延を模している
const DELAY_MS = 800;

export function mockApi(): Plugin {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use("/api/items", async (req, res) => {
        const url = new URL(req.url ?? "", "http://localhost");
        const offset = Number(url.searchParams.get("offset") ?? 0);
        const volume = Number(url.searchParams.get("volume") ?? 10);

        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

        const length = Math.max(0, Math.min(volume, TOTAL - offset));
        const items: Item[] = Array.from({ length }, (_, i) => {
          const id = offset + i;
          return { id, title: `アイテム #${id}` };
        });

        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(items));
      });
    },
  };
}
