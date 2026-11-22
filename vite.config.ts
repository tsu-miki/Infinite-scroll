import { defineConfig } from "vite";
import { mockApi } from "./server/mock-api";

export default defineConfig({
  plugins: [mockApi()],
  build: {
    rolldownOptions: {
      input: ["index.html", "cursor.html", "detail.html"],
    },
  },
});
