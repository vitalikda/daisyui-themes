import { $ } from "bun";

const cache = new Map<string, { css: string; mtime: number }>();

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;

    if (path === "/") {
      path = "/index.html";
    }

    // On-demand CSS compilation for /dist/*.css requests
    if (path.startsWith("/dist/") && path.endsWith(".css")) {
      const themeName = path.replace("/dist/", "").replace(".css", "");
      const sourceFile = `./themes/${themeName}.css`;

      const source = Bun.file(sourceFile);
      if (await source.exists()) {
        const stat = await source.stat();
        const mtime = stat?.mtime?.getTime() ?? 0;

        // Check cache
        const cached = cache.get(themeName);
        if (cached && cached.mtime === mtime) {
          return new Response(cached.css, {
            headers: { "Content-Type": "text/css" },
          });
        }

        // Compile with Tailwind CLI
        try {
          const result = await $`bunx @tailwindcss/cli -i ${sourceFile}`.text();
          cache.set(themeName, { css: result, mtime });
          console.log(`Compiled ${themeName}.css`);
          return new Response(result, {
            headers: { "Content-Type": "text/css" },
          });
        } catch (error) {
          console.error(`Failed to compile ${themeName}.css:`, error);
          return new Response("CSS compilation failed", { status: 500 });
        }
      }
    }

    // List available themes for /api/themes
    if (path === "/api/themes") {
      const themes: string[] = [];
      const glob = new Bun.Glob("*.css");
      for await (const file of glob.scan("./themes")) {
        themes.push(file.replace(".css", ""));
      }
      return new Response(JSON.stringify(themes), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Serve static files
    const file = Bun.file("." + path);
    if (await file.exists()) {
      return new Response(file);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`
🎨 DaisyUI Theme Preview Server
   
   http://localhost:${server.port}
   
   Themes are compiled on-demand from ./themes/*.css
`);
