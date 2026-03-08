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
  
  // Collect font imports and theme content separately
  const fontImports: string[] = [];
  const themeContents: string[] = [];
  
  for (const theme of customThemes) {
    const content = await Bun.file(`./themes/${theme}.css`).text();
    // Extract @import url(...) statements for fonts
    const lines = content.split('\n');
    const fontLines: string[] = [];
    const otherLines: string[] = [];
    
    for (const line of lines) {
      if (line.trim().startsWith('@import url(')) {
        fontLines.push(line);
      } else {
        otherLines.push(line);
      }
    }
    
    fontImports.push(...fontLines);
    themeContents.push(otherLines.join('\n'));
  }
  
  // Build source with font imports at the very top
  let source = '';
  if (fontImports.length > 0) {
    source += fontImports.join('\n') + '\n\n';
  }
  source += `@import "tailwindcss";\n@plugin "daisyui" {\n  themes: ${builtinList};\n}\n\n`;
  source += themeContents.join('\n\n');
  
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
