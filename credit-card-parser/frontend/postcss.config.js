// Try to use the new Tailwind postcss plugin when available,
// otherwise fall back to the classic `tailwindcss` package.
module.exports = (() => {
  const plugins = [];
  try {
    // New plugin name used by Tailwind v4+
    plugins.push(require('@tailwindcss/postcss'));
  } catch (e) {
    try {
      // Fall back to older tailwind package if present
      plugins.push(require('tailwindcss'));
    } catch (e2) {
      // Neither plugin is installed — PostCSS will run but Tailwind won't be applied.
      // Leave plugins array as-is; the dev server will show a clearer error.
      // Log to console to aid local debugging.
      // (Don't throw here so CRA can show its usual build output.)
      // eslint-disable-next-line no-console
      console.error('Warning: neither @tailwindcss/postcss nor tailwindcss is available.');
    }
  }

  // autoprefixer is safe to include
  try {
    plugins.push(require('autoprefixer'));
  } catch (e) {
    // autoprefixer missing — ignore and let CRA handle it or show an error later.
    // eslint-disable-next-line no-console
    console.error('Warning: autoprefixer is not installed.');
  }

  return { plugins };
})();
