# daisyUI Themes

Custom themes for [daisyUI 5](https://daisyui.com).

## Using a theme

Copy the theme CSS into your project's CSS file, after your daisyUI plugin:

```css
@import "tailwindcss";
@plugin "daisyui";

/* paste theme here */
```

Each theme file in `themes/` is fully self-contained — copy the entire file contents.

## Available themes

| Theme | Description |
|-------|-------------|
| [comics](themes/comics.css) | Bold, flat comic-book style with hard shadows and zero border-radius |
| [pixelated](themes/pixelated.css) | Retro pixel-art style with SVG pixelated borders and VT323 font |

## Development

```bash
bun install
bun dev
```

Opens a preview server with live theme switching. All built-in daisyUI themes and custom themes are available in the dropdown.

## Adding a theme

Create a new `.css` file in `themes/`. It needs:

1. A `@plugin "daisyui/theme"` block with all required color and design token variables
2. Optionally, a `[data-theme="your-theme"]` block with custom CSS overrides

See any existing theme file for reference. The dev server picks up new files automatically.