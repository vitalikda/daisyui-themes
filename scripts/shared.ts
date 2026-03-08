import { $ } from "bun";
import themesObject from "daisyui/theme/object.js";

export const BUILTIN_THEMES = Object.keys(themesObject).sort();

export async function getCustomThemes(): Promise<string[]> {
  const themes: string[] = [];
  const glob = new Bun.Glob("*.css");
  for await (const file of glob.scan("./themes")) {
    themes.push(file.replace(".css", ""));
  }
  return themes.sort();
}

export async function generateSource(): Promise<string> {
  const customThemes = await getCustomThemes();
  const builtinList = BUILTIN_THEMES.join(", ");
  let source = `@import "tailwindcss";\n@plugin "daisyui" {\n  themes: ${builtinList};\n}\n\n`;
  for (const theme of customThemes) {
    source += await Bun.file(`./themes/${theme}.css`).text() + "\n\n";
  }
  return source;
}

export async function compileCss(opts?: { minify?: boolean }): Promise<string> {
  const source = await generateSource();
  const tmpFile = "./.tmp-combined.css";
  await Bun.write(tmpFile, source);
  if (opts?.minify) {
    return await $`bunx @tailwindcss/cli -i ${tmpFile} --minify`.text();
  }
  return await $`bunx @tailwindcss/cli -i ${tmpFile}`.text();
}
