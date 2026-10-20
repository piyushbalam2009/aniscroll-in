import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";
import apiHandler from "./api/[...path].js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Keep Vercel's serverless handler usable during local Codespaces development.
  // Do not expose the Client ID through Vite's client-side env variables.
  if (!process.env.MAL_CLIENT_ID && env.MAL_CLIENT_ID) {
    process.env.MAL_CLIENT_ID = env.MAL_CLIENT_ID;
  }

  return {
    appType: "mpa",
    plugins: [{
      name: "aniscroll-api-routes",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url || !req.url.startsWith("/api/")) return next();
          Promise.resolve(apiHandler(req, res)).catch((error) => {
            if (res.headersSent) return next(error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "Aniscroll API route failed" }));
          });
        });
      },
    }],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          home: resolve(process.cwd(), "index.html"),
          anime: resolve(process.cwd(), "anime.html"),
          watch: resolve(process.cwd(), "watch.html"),
          search: resolve(process.cwd(), "search.html"),
          schedule: resolve(process.cwd(), "schedule.html"),
          watchlist: resolve(process.cwd(), "watchlist.html"),
          history: resolve(process.cwd(), "history.html"),
          notFound: resolve(process.cwd(), "404.html"),
        },
      },
    },
  };
});
