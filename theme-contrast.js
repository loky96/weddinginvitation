// Keep the light invitation unless the browser darkens even an explicitly light surface.
(() => {
  if (!window.CSS?.supports('background-color', 'Canvas')) return;
  const root = document.documentElement;
  const preference = matchMedia('(prefers-color-scheme: dark)');
  const forcedColors = matchMedia('(forced-colors: active)');
  function checkTheme(forceRedraw = false) {
    const probe = document.createElement('div');
    probe.style.cssText = 'display:none;background-color:Canvas;color-scheme:only light';
    document.body.appendChild(probe);
    const canvas = getComputedStyle(probe).backgroundColor;
    probe.remove();
    const channels = canvas.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/)?.slice(1).map(Number);
    const darkened = !forcedColors.matches && channels?.length === 3 && Math.max(...channels) < 128;
    const wasDark = root.classList.contains('auto-dark-theme');
    root.classList.toggle('auto-dark-theme', Boolean(darkened));
    if (wasDark !== Boolean(darkened) || forceRedraw === true) dispatchEvent(new Event('invitation-themechange'));
  }
  checkTheme();
  preference.addEventListener('change', () => requestAnimationFrame(() => checkTheme(true)));
  forcedColors.addEventListener('change', checkTheme);
  addEventListener('pageshow', checkTheme);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkTheme(); });
})();
