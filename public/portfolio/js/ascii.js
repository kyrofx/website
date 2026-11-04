// Reconstruct the visible page in a character grid, then resolve to real HTML.
// No screenshots, network requests, or runtime dependencies are needed.
(() => {
  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const site = document.querySelector('.site');
  const clamp = (value) => Math.max(0, Math.min(1, value));
  let active = null;
  let navigating = false;
  let departureCanvas = null;
  let departureTimer;

  function clearDeparture() {
    if (departureCanvas) navigating = false;
    departureCanvas?.remove();
    departureCanvas = null;
    clearTimeout(departureTimer);
  }

  function ready() {
    clearTimeout(window.asciiSafetyTimer);
    root.classList.remove('ascii-pending', 'ascii-active');
    window.dispatchEvent(new Event('ascii:ready'));
  }

  // Sample actual text positions, including line wrapping and letter spacing.
  function samplePage(width, height, cellWidth, cellHeight) {
    const columns = Math.ceil(width / cellWidth);
    const rows = Math.ceil(height / cellHeight);
    const mask = document.createElement('canvas');
    mask.width = columns;
    mask.height = rows;
    const context = mask.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    context.scale(1 / cellWidth, 1 / cellHeight);
    context.fillStyle = '#111';
    context.textBaseline = 'alphabetic';
    site.querySelectorAll('.navigation, .navigation a.is-highlighted').forEach((element) => {
      const rect = element.getBoundingClientRect();
      context.fillStyle = element.matches('a') ? '#111' : '#f5f5f5';
      context.fillRect(rect.left, rect.top, rect.width, rect.height);
    });
    const walker = document.createTreeWalker(site, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    const styles = new WeakMap();
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!node.textContent.trim() || !parent || parent.closest('[hidden], svg')) continue;
      if (!parent.getClientRects().length) continue;
      let style = styles.get(parent);
      if (!style) { style = getComputedStyle(parent); styles.set(parent, style); }
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      const box = parent.getBoundingClientRect();
      if (box.bottom < 0 || box.top > height) continue;
      const size = parseFloat(style.fontSize);
      context.font = `${style.fontStyle} ${style.fontWeight} ${size}px ${style.fontFamily}`;
      context.fillStyle = style.color;
      const metrics = context.measureText('M');
      const ascent = metrics.fontBoundingBoxAscent || size * .8;
      for (let i = 0; i < node.length; i++) {
        const char = node.textContent[i];
        if (!char.trim()) continue;
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const rect = range.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > height || rect.width === 0) continue;
        context.fillText(char, rect.left, rect.top + ascent);
      }
    }
    range.detach();
    context.fillStyle = '#111';
    site.querySelectorAll('.site-header, .project, .project-list, .site-footer, .facts, .facts > div, .contact-details, .contact-details > div').forEach((element) => {
      if (!element.getClientRects().length) return;
      const rect = element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > height) return;
      const style = getComputedStyle(element);
      for (const edge of ['Top', 'Bottom']) {
        const thickness = parseFloat(style[`border${edge}Width`]);
        if (thickness) context.fillRect(rect.left, edge === 'Top' ? rect.top : rect.bottom - thickness, rect.width, thickness);
      }
    });
    const nameplate = site.querySelector('.nameplate');
    if (nameplate) {
      const rect = nameplate.getBoundingClientRect();
      context.fillRect(rect.left, rect.bottom - 5, rect.width, 5);
    }
    const pixels = context.getImageData(0, 0, columns, rows).data;
    const cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const offset = (y * columns + x) * 4;
        const ink = pixels[offset + 3] / 255 * (1 - pixels[offset] / 255);
        // Stable noise avoids flicker and provides an ordered, irregular assembly.
        const seed = ((x * 374761393 + y * 668265263) >>> 0) % 1000 / 1000;
        cells.push({ x: x * cellWidth, y: y * cellHeight, ink, seed, order: y / rows * .65 + seed * .35 });
      }
    }
    return cells;
  }

  function play(direction, duration) {
    if (preference.matches || !site || document.hidden) { ready(); return Promise.resolve(true); }
    active?.finish(true);
    clearDeparture();
    root.classList.add('ascii-used');
    return new Promise((resolve) => {
      let canvas;
      let frame;
      let watchdog;
      let finished = false;
      const finish = (proceed = true) => {
        if (finished) return;
        finished = true;
        cancelAnimationFrame(frame);
        clearTimeout(watchdog);
        if (direction === 'leave' && proceed && canvas?.isConnected) {
          // Hold the last frame across the real document request, without trapping
          // the old page if the network stalls or navigation gets cancelled.
          departureCanvas = canvas;
          departureTimer = setTimeout(() => { clearDeparture(); navigating = false; }, 1500);
        } else canvas?.remove();
        active = null;
        ready();
        resolve(proceed);
      };
      active = { direction, finish };
      try {
        const width = innerWidth;
        const height = innerHeight;
        // Bound the grid even on large displays; mobile characters remain legible.
        const cellWidth = Math.max(7, Math.ceil(width / 170));
        const cellHeight = Math.round(cellWidth * 1.45);
        const cells = samplePage(width, height, cellWidth, cellHeight);
        if (!cells) { finish(); return; }
        canvas = document.createElement('canvas');
        canvas.className = 'ascii-screen';
        canvas.dataset.phase = direction;
        canvas.setAttribute('aria-hidden', 'true');
        const pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        const context = canvas.getContext('2d');
        if (!context) { finish(); return; }
        document.body.append(canvas);
        root.classList.add('ascii-active');
        root.classList.remove('ascii-pending');
        clearTimeout(window.asciiSafetyTimer);
        const glyphs = '.:-=+*#%@';
        const focus = site.querySelector('h1')?.getBoundingClientRect();
        const centerX = focus ? Math.min(width * .6, focus.left + focus.width / 2) : width / 2;
        const centerY = focus ? Math.min(height * .5, focus.top + focus.height / 2) : height * .4;
        const started = performance.now();
        const zoomStart = direction === 'leave' ? 1.15 : duration > 1000 ? 3.1 : 1.8;
        const draw = (now) => {
          try {
            const elapsed = clamp((now - started) / duration);
            const progress = direction === 'leave' ? 1 - elapsed : elapsed;
            const zoom = 1 + (zoomStart - 1) * Math.pow(1 - clamp(progress / .7), 3);
            const resolveAmount = clamp((progress - .58) / .34);
            const build = clamp(.2 + progress * 1.75);
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            context.clearRect(0, 0, width, height);
            context.fillStyle = '#fff';
            context.fillRect(0, 0, width, height);
            context.translate(centerX, centerY);
            context.scale(zoom, zoom);
            context.translate(-centerX, -centerY);
            context.font = `${cellHeight - 1}px "Courier New", monospace`;
            context.textBaseline = 'top';
            context.fillStyle = '#111';
            for (const cell of cells) {
              const screenX = centerX + (cell.x - centerX) * zoom;
              const screenY = centerY + (cell.y - centerY) * zoom;
              if (screenX > width || screenY > height || screenX + cellWidth * zoom < 0 || screenY + cellHeight * zoom < 0) continue;
              if (resolveAmount > cell.order) {
                context.clearRect(cell.x, cell.y, cellWidth + .5, cellHeight + .5);
                continue;
              }
              if (cell.ink < .025 || cell.seed > build) continue;
              const density = clamp(cell.ink * 1.4);
              const index = Math.min(glyphs.length - 1, Math.floor(density * glyphs.length));
              // Character variation slows to a stable rendering before the dissolve.
              const char = progress < .5 && cell.seed > progress ? glyphs[(index + Math.floor(progress * 18)) % glyphs.length] : glyphs[index];
              context.globalAlpha = .45 + density * .55;
              context.fillText(char, cell.x, cell.y);
            }
            context.globalAlpha = 1;
            canvas.style.opacity = String(clamp((1 - progress) / .1));
            if (elapsed >= 1) finish();
            else frame = requestAnimationFrame(draw);
          } catch { finish(); }
        };
        draw(started);
        watchdog = setTimeout(finish, duration + 500);
      } catch { finish(); }
    });
  }

  const skipEntrance = () => {
    if (active?.direction === 'enter') active.finish();
    clearDeparture();
  };
  document.addEventListener('pointerdown', skipEntrance, { capture: true, passive: true });
  document.addEventListener('wheel', skipEntrance, { passive: true });
  document.addEventListener('keydown', (event) => {
    if (active?.direction === 'enter') active.finish();
    else if (event.key === 'Escape') { active?.finish(false); clearDeparture(); }
  });
  window.addEventListener('resize', () => { active?.finish(); clearDeparture(); });
  window.addEventListener('ascii:abort', () => { active?.finish(); clearDeparture(); });
  window.addEventListener('pagehide', () => { active?.finish(false); clearDeparture(); });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) { active?.finish(false); clearDeparture(); navigating = false; ready(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) active?.finish(); });
  preference.addEventListener('change', () => { if (preference.matches) { active?.finish(); clearDeparture(); ready(); } });

  document.addEventListener('click', async (event) => {
    const link = event.target.closest('a[href]');
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      || !link || link.hasAttribute('download') || (link.target && link.target !== '_self') || preference.matches) return;
    const destination = new URL(link.href, location.href);
    // Real document navigation preserves history, translated routes, and deep links.
    if (destination.origin !== location.origin || !/\/(?:ca\/)?(?:index|projects|about|contact)?(?:\.html)?$/.test(destination.pathname)) return;
    if (destination.pathname === location.pathname && destination.search === location.search) return;
    event.preventDefault();
    if (navigating) return;
    navigating = true;
    const proceed = await play('leave', 180);
    if (proceed) location.assign(destination.href);
    else navigating = false;
  });

  const navigation = performance.getEntriesByType('navigation')[0];
  let internal = false;
  try { internal = document.referrer && new URL(document.referrer).origin === location.origin; } catch { /* No referrer. */ }
  if (!root.classList.contains('ascii-pending') || navigation?.type === 'back_forward' || preference.matches) ready();
  else play('enter', internal && navigation?.type !== 'reload' ? 800 : 1850);
})();
