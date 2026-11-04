// Content, navigation, and every project link work without JavaScript.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const runningAnimations = new Set();
const elementAnimations = new WeakMap();

function animate(element, frames, options = {}) {
  elementAnimations.get(element)?.cancel();
  if (motionPreference.matches || !element.animate) return;
  const animation = element.animate(frames, {
    duration: 550, easing: 'cubic-bezier(.16, 1, .3, 1)', ...options,
  });
  runningAnimations.add(animation);
  elementAnimations.set(element, animation);
  const clean = () => runningAnimations.delete(animation);
  animation.addEventListener('finish', clean, { once: true });
  animation.addEventListener('cancel', clean, { once: true });
}

motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) runningAnimations.forEach((animation) => animation.cancel());
});

// A shared highlight follows pointer and keyboard focus without moving the links.
const navigation = document.querySelector('.navigation');
if (navigation) {
  const links = [...navigation.querySelectorAll('a')];
  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  navigation.prepend(indicator);
  navigation.classList.add('has-indicator');
  let highlighted = null;
  const highlight = (link) => {
    highlighted = link;
    links.forEach((item) => item.classList.toggle('is-highlighted', item === link));
    indicator.style.opacity = link ? '1' : '0';
    if (link) {
      indicator.style.width = `${link.offsetWidth}px`;
      indicator.style.transform = `translateX(${link.offsetLeft}px)`;
    }
  };
  const restore = () => highlight(links.find((link) => link === document.activeElement)
    || links.find((link) => link.hasAttribute('aria-current')));
  navigation.addEventListener('pointerover', (event) => {
    const link = event.target.closest('a');
    if (link) highlight(link);
  });
  navigation.addEventListener('pointerleave', restore);
  navigation.addEventListener('focusin', (event) => highlight(event.target.closest('a')));
  navigation.addEventListener('focusout', () => queueMicrotask(restore));
  window.addEventListener('resize', () => highlight(highlighted));
  restore();
}

// Damped springs move only while the name is being touched, hovered, or settling.
const nameplate = document.querySelector('.nameplate');
if (nameplate) {
  const name = nameplate.querySelector('.name');
  const letters = [...name.querySelectorAll('.letter')];
  const states = letters.map(() => ({ x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0, tx: 0, ty: 0, tr: 0 }));
  let frame = 0;
  let previousTime = 0;
  let bounds;
  let centers;
  const measure = () => {
    bounds = name.getBoundingClientRect();
    centers = letters.map((letter) => bounds.left + letter.offsetLeft + letter.offsetWidth / 2);
  };
  const render = (letter, state) => {
    letter.style.setProperty('--letter-x', `${state.x.toFixed(3)}px`);
    letter.style.setProperty('--letter-y', `${state.y.toFixed(3)}px`);
    letter.style.setProperty('--letter-r', `${state.r.toFixed(3)}deg`);
    letter.style.setProperty('--echo-x', `${(-state.x * .7).toFixed(3)}px`);
    letter.style.setProperty('--echo-y', `${(-state.y * .65).toFixed(3)}px`);
    letter.style.setProperty('--echo-opacity', Math.min(.4, Math.abs(state.y) / 65).toFixed(3));
  };
  const tick = (time) => {
    const dt = Math.min((time - previousTime) / 1000 || .016, .032);
    previousTime = time;
    let moving = false;
    states.forEach((state, i) => {
      for (const axis of ['x', 'y', 'r']) {
        const target = state[`t${axis}`];
        const velocity = `v${axis}`;
        state[velocity] += ((target - state[axis]) * 190 - state[velocity] * 20) * dt;
        state[axis] += state[velocity] * dt;
        if (Math.abs(target - state[axis]) > .02 || Math.abs(state[velocity]) > .02) moving = true;
        else { state[axis] = target; state[velocity] = 0; }
      }
      render(letters[i], state);
    });
    frame = moving ? requestAnimationFrame(tick) : 0;
  };
  const start = () => {
    if (!frame) { previousTime = performance.now(); frame = requestAnimationFrame(tick); }
  };
  const respond = (event) => {
    if (motionPreference.matches || !event.isPrimary) return;
    if (!bounds) measure();
    const vertical = Math.max(0, 1 - Math.abs(event.clientY - (bounds.top + bounds.height / 2)) / bounds.height);
    states.forEach((state, i) => {
      const distance = event.clientX - centers[i];
      const influence = Math.max(0, 1 - Math.abs(distance) / (bounds.width * .42)) * vertical;
      state.tx = distance * influence * .045;
      state.ty = -30 * influence;
      state.tr = distance * influence * .025;
      letters[i].classList.toggle('is-near', Math.abs(distance) < letters[i].offsetWidth * .5 && vertical > .4);
    });
    start();
  };
  const release = () => {
    states.forEach((state) => { state.tx = 0; state.ty = 0; state.tr = 0; });
    letters.forEach((letter) => letter.classList.remove('is-near'));
    if (!motionPreference.matches) start();
  };
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    states.forEach((state, i) => {
      Object.keys(state).forEach((key) => { state[key] = 0; });
      render(letters[i], state);
      letters[i].classList.remove('is-near');
    });
    bounds = null;
    name.classList.toggle('is-kinetic', !motionPreference.matches);
  };
  nameplate.addEventListener('pointerenter', (event) => { measure(); respond(event); });
  nameplate.addEventListener('pointermove', respond);
  nameplate.addEventListener('pointerdown', (event) => { measure(); respond(event); });
  nameplate.addEventListener('pointerup', (event) => { if (event.pointerType !== 'mouse') release(); });
  nameplate.addEventListener('pointerleave', release);
  nameplate.addEventListener('pointercancel', release);
  window.addEventListener('resize', reset);
  window.addEventListener('blur', reset);
  window.addEventListener('scroll', () => { bounds = null; }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  motionPreference.addEventListener('change', reset);
  reset();
}

// Enter from the side the pointer actually crosses, rather than always wiping up.
document.querySelectorAll('.project a').forEach((link) => {
  link.addEventListener('pointerenter', (event) => {
    const bounds = link.getBoundingClientRect();
    link.style.setProperty('--entry-edge', event.clientY < bounds.top + bounds.height / 2 ? 'top' : 'bottom');
  });
});

function observeEntrances() {
  if (!('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('.home-content h2, .project, .contact-links li, .facts > div, .contact-details > div, .site-footer');
  const assembled = new WeakSet();
  if (document.documentElement.classList.contains('ascii-used')) {
    targets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) assembled.add(target);
    });
  }
  const observer = new IntersectionObserver((entries) => {
    let order = 0;
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      if (assembled.has(target)) return;
      animate(target, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { delay: Math.min(order++ * 45, 180) });
    });
  }, { threshold: .12 });
  targets.forEach((target) => observer.observe(target));
}
if (document.documentElement.classList.contains('ascii-pending')) {
  window.addEventListener('ascii:ready', observeEntrances, { once: true });
} else observeEntrances();

const filters = document.querySelector('.project-filters');
if (filters) {
  const buttons = [...filters.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('.project-index .project')];
  const status = document.querySelector('[data-filter-status]');
  filters.hidden = false;
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    const previousPositions = new Map(projects.filter((project) => !project.hidden).map((project) => [project, project.getBoundingClientRect().top]));
    projects.forEach((project) => elementAnimations.get(project)?.cancel());
    buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    projects.forEach((project) => {
      const matches = button.dataset.filter === 'all' || project.dataset.language === button.dataset.filter;
      project.hidden = !matches;
      if (matches) count++;
    });
    projects.filter((project) => !project.hidden).forEach((project, i) => {
      const existed = previousPositions.has(project);
      const offset = existed ? previousPositions.get(project) - project.getBoundingClientRect().top : 16;
      animate(project, [
        { opacity: existed ? 1 : 0, transform: `translateY(${offset}px)` },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 420, delay: existed ? 0 : i * 30 });
    });
    status.textContent = `${count} ${count === 1 ? status.dataset.singular : status.dataset.noun}`;
  });
}

const copyButton = document.querySelector('[data-copy]');
if (copyButton && navigator.clipboard && window.isSecureContext) {
  copyButton.hidden = false;
  let resetLabel;
  const label = copyButton.textContent;
  copyButton.addEventListener('click', async () => {
    const status = document.querySelector('[data-copy-status]');
    try {
      await navigator.clipboard.writeText(copyButton.dataset.copy);
      status.textContent = copyButton.dataset.success;
      copyButton.textContent = copyButton.dataset.copied;
      clearTimeout(resetLabel);
      resetLabel = setTimeout(() => { copyButton.textContent = label; }, 2000);
    } catch {
      status.textContent = copyButton.dataset.failure;
    }
  });
}
