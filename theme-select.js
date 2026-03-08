const themeSelect = document.getElementById("theme-select");
const copyBtn = document.getElementById("copy-btn");

let themeData = { builtin: [], custom: [] };

async function loadThemes() {
  try {
    const response = await fetch("/themes.json");
    themeData = await response.json();

    let html = "";
    if (themeData.custom.length > 0) {
      html += '<optgroup label="Custom">';
      html += themeData.custom
        .map((t) => `<option value="${t}">${capitalize(t)}</option>`)
        .join("");
      html += "</optgroup>";
    }
    html += '<optgroup label="Built-in">';
    html += themeData.builtin
      .map((t) => `<option value="${t}">${capitalize(t)}</option>`)
      .join("");
    html += "</optgroup>";

    themeSelect.innerHTML = html;

    const urlTheme = new URLSearchParams(window.location.search).get("theme");
    const allThemes = [...themeData.custom, ...themeData.builtin];
    if (urlTheme && allThemes.includes(urlTheme)) {
      themeSelect.value = urlTheme;
    } else if (themeData.custom.length > 0) {
      themeSelect.value = themeData.custom[0];
    }

    switchTheme(themeSelect.value);
  } catch (error) {
    console.error("Failed to load themes:", error);
  }
}

function switchTheme(themeName) {
  document.documentElement.setAttribute("data-theme", themeName);

  const url = new URL(window.location);
  url.searchParams.set("theme", themeName);
  window.history.replaceState({}, "", url);

  copyBtn.textContent = "Copy";
}

async function copyTheme() {
  const themeName = themeSelect.value;
  const isCustom = themeData.custom.includes(themeName);

  let text;
  if (isCustom) {
    const response = await fetch(`/themes/${themeName}.css`);
    text = await response.text();
  } else {
    text = `@plugin "daisyui" {\n  themes: ${themeName} --default;\n}`;
  }

  await navigator.clipboard.writeText(text);
  copyBtn.textContent = "Copied!";
  setTimeout(() => {
    copyBtn.textContent = "Copy";
  }, 2000);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

themeSelect.addEventListener("change", (e) => switchTheme(e.target.value));
copyBtn.addEventListener("click", copyTheme);

loadThemes();

// Hot reload in dev (SSE endpoint won't exist in production)
const events = new EventSource("/__reload");
events.onmessage = (e) => {
  if (e.data === "reload") {
    const link = document.querySelector('link[href*="styles.css"]');
    if (link) link.href = `./styles.css?t=${Date.now()}`;
    loadThemes();
  }
};
events.onerror = () => events.close();
