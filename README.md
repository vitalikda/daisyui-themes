# daisyUI Themes

> **Warning**
> These themes are a work in progress. APIs, styling, and component coverage may change without notice.

Custom themes for [daisyUI 5](https://daisyui.com).

**Live preview:** https://daisyui.vitaly.im

## Available Themes

| Theme | Description |
|-------|-------------|
| [comics](themes/comics.css) | NeoBrutalism style with thick black borders, hard offset shadows, and bold colors |
| [pixelated](themes/pixelated.css) | Retro pixel-art style inspired by [Dksie09/RetroUI](https://github.com/Dksie09/RetroUI) with Press Start 2P font |
| [te-ko2](themes/te-ko2.css) | Industrial design inspired by Teenage Engineering EP-133 K.O. II with LCD displays and tactile controls |

## Installation

Copy the theme CSS into your project's CSS file, after your daisyUI plugin:

```css
@import "tailwindcss";
@plugin "daisyui";

/* Paste entire theme file contents here */
```

Each theme file in `themes/` is fully self-contained.

## Usage

Apply a theme using the `data-theme` attribute:

```html
<html data-theme="comics">
  <!-- your content -->
</html>
```

Or scope it to a specific element:

```html
<div data-theme="pixelated">
  <button class="btn btn-primary">Pixel Button</button>
</div>
```

## Development

```bash
bun install
bun dev
```

Opens a preview server at `http://localhost:3000` with live theme switching. All built-in daisyUI themes and custom themes are available in the dropdown.

## Adding a Theme

Create a new `.css` file in `themes/`. It needs:

1. A `@plugin "daisyui/theme"` block with required color and design token variables
2. Optionally, a `[data-theme="your-theme"]` block with custom component styles

See existing theme files for reference. The dev server picks up new files automatically.

## License

MIT
