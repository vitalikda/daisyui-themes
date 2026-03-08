import { watch } from "fs";
import { BUILTIN_THEMES, getCustomThemes, compileCss } from "./shared.ts";

let cssCache: string | null = null;
const encoder = new TextEncoder();
const sseClients = new Set<ReadableStreamDefaultController>();

watch("./themes", { recursive: true }, (_event, filename) => {
  cssCache = null;
  console.log(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m \x1b[36m↻\x1b[0m ${filename ?? "themes"} changed, recompiling...`);
  for (const client of sseClients) {
    try {
      client.enqueue(encoder.encode("data: reload\n\n"));
    } catch {
      sseClients.delete(client);
    }
  }
});

async function getCss(): Promise<string> {
  if (cssCache) return cssCache;
  const start = performance.now();
  cssCache = await compileCss();
  const ms = (performance.now() - start).toFixed(0);
  console.log(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m \x1b[32m✓\x1b[0m compiled styles.css in ${ms}ms`);
  return cssCache;
}

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;

    if (path === "/") path = "/index.html";

    if (path === "/styles.css") {
      try {
        return new Response(await getCss(), {
          headers: { "Content-Type": "text/css" },
        });
      } catch (error) {
        console.error(`\x1b[31m✗\x1b[0m compilation failed:`, error);
        return new Response("CSS compilation failed", { status: 500 });
      }
    }

    if (path === "/themes.json") {
      const custom = await getCustomThemes();
      return new Response(JSON.stringify({ builtin: BUILTIN_THEMES, custom }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path === "/__reload") {
      let ctrl: ReadableStreamDefaultController;
      const stream = new ReadableStream({
        start(controller) {
          ctrl = controller;
          sseClients.add(controller);
        },
        cancel() {
          sseClients.delete(ctrl);
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const file = Bun.file("." + path);
    if (await file.exists()) {
      return new Response(file);
    }

    return new Response("Not Found", { status: 404 });
  },
});

const custom = await getCustomThemes();
console.log(`
  \x1b[1mdaisyui-themes\x1b[0m dev server

  \x1b[36m➜\x1b[0m http://localhost:${server.port}

  \x1b[2m${BUILTIN_THEMES.length} built-in themes\x1b[0m
  \x1b[2m${custom.length} custom themes: ${custom.join(", ")}\x1b[0m
  \x1b[2mwatching ./themes/ for changes\x1b[0m
`);
