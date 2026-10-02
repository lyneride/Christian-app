/**
 * Inline script executed before hydration so the correct theme class is on <html>
 * and there is no flash of the wrong theme. Preference is stored in localStorage
 * under "theme" ("light" | "dark" | "system").
 */
const script = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var dark = stored === "dark" || ((stored === null || stored === "system") && systemDark);
    var root = document.documentElement;
    if (dark) root.classList.add("dark"); else root.classList.remove("dark");
    root.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
