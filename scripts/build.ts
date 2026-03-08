import { $ } from "bun";
import { BUILTIN_THEMES, getCustomThemes, compileCss } from "./shared.ts";

async function build() {
  const start = performance.now();
  const customThemes = await getCustomThemes();

  console.log(`\x1b[36m➜\x1b[0m compiling ${customThemes.length} custom + ${BUILTIN_THEMES.length} built-in themes...`);

  const css = await compileCss({ minify: true });

  await $`rm -rf dist && mkdir -p dist/themes`;

  await Bun.write("dist/styles.css", css);
  await Bun.write("dist/index.html", await Bun.file("index.html").text());
  await Bun.write("dist/theme-select.js", await Bun.file("theme-select.js").text());
  await Bun.write("dist/themes.json", JSON.stringify({ builtin: BUILTIN_THEMES, custom: customThemes }));

  for (const theme of customThemes) {
    await Bun.write(`dist/themes/${theme}.css`, await Bun.file(`themes/${theme}.css`).text());
  }

  await $`rm -f .tmp-combined.css`;

  const ms = (performance.now() - start).toFixed(0);
  const size = (css.length / 1024).toFixed(1);
  console.log(`\x1b[32m✓\x1b[0m built to dist/ in ${ms}ms (${size} kB)`);
}

build();
