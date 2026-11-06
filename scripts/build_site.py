"""Generate the static English and Catalan pages: python3 scripts/build_site.py."""
from html import escape
from hashlib import sha256
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'portfolio'
DOMAIN = 'https://kyro.cat'
EMAIL = 'hello@kyro.dog'
PAGES = ['index', 'projects', 'about', 'contact']

# Deliberately empty project slots; no real names, dates or destinations.
PROJECTS = range(1, 6)
EMBED_TEXT = 'kyro dot cat website'

COPY = {
    'en': {
        'nav': ['home', 'projects', 'about', 'contact'],
        'navigation': 'Navigation', 'languages': 'Language', 'skip': 'Skip to content',
        'all': 'all', 'all_projects': 'all projects', 'results': 'projects', 'result': 'project',
        'location_label': 'location', 'location': 'SF Bay Area & VA',
        'studying': 'studying', 'studies': 'Electrical & Computer Engineering',
        'code': 'code', 'systems': 'systems', 'systems_value': 'Servers · networking · embedded',
        'homelab': 'homelab', 'cores': 'cores', 'threads': 'threads',
        'cuda': 'CUDA cores', 'onboard_memory': 'onboard memory',
        'email': 'email', 'copy': 'copy', 'copied': 'copied', 'copy_label': 'Copy email address',
        'copy_success': 'Email address copied.',
        'copy_failure': 'Copy unavailable. Select the email address to copy it.',
        'replay': 'replay intro', 'replay_label': 'Replay the ASCII intro animation',
        'foot_language': 'Català', 'pride_label': 'Gay men’s pride flag',
    },
    'ca': {
        'nav': ['inici', 'projectes', 'sobre mi', 'contacte'],
        'navigation': 'Navegació', 'languages': 'Llengua', 'skip': 'Ves al contingut',
        'all': 'tots', 'all_projects': 'tots els projectes', 'results': 'projectes', 'result': 'projecte',
        'location_label': 'ubicació', 'location': 'Badia de San Francisco i Virgínia',
        'studying': 'estudis', 'studies': 'Enginyeria elèctrica i informàtica',
        'code': 'codi', 'systems': 'sistemes', 'systems_value': 'Servidors · xarxes · sistemes encastats',
        'homelab': 'laboratori domèstic', 'cores': 'nuclis', 'threads': 'fils',
        'cuda': 'nuclis CUDA', 'onboard_memory': 'memòria integrada',
        'email': 'correu', 'copy': 'copia', 'copied': 'copiat', 'copy_label': 'Copia l’adreça de correu',
        'copy_success': 'Adreça de correu copiada.',
        'copy_failure': 'No s’ha pogut copiar. Selecciona l’adreça de correu per copiar-la.',
        'replay': 'repeteix', 'replay_label': 'Repeteix l’animació d’introducció ASCII',
        'foot_language': 'English', 'pride_label': 'Bandera de l’orgull gai',
    },
}

ARROW = '<svg class="arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10" stroke="currentColor" stroke-width="1.5"/></svg>'


def asset(path):
    return f'{path}?v={sha256((ROOT / path).read_bytes()).hexdigest()[:10]}'


def route(lang, page):
    prefix = '/ca' if lang == 'ca' else ''
    return (prefix or '/') if page == 'index' else f'{prefix}/{page}'


def url(lang, page):
    return DOMAIN + route(lang, page)


def project_list(projects, c):
    rows = []
    for number in projects:
        rows.append(f'''<li class="project">
          <div class="project-entry"><span class="project-name">{c['result']} {number:02d}</span><span class="project-category">—</span><span class="project-year">—</span></div>
        </li>''')
    return '<ul class="project-list">\n' + '\n'.join(rows) + '\n</ul>'


def contacts(c, full=False):
    email = f'<a href="mailto:{EMAIL}">{EMAIL}</a>'
    copy = f'''<button class="copy-button" data-copy="{EMAIL}" data-success="{c['copy_success']}" data-failure="{c['copy_failure']}" data-copied="{c['copied']}" aria-label="{c['copy_label']}" hidden>{c['copy']}</button>'''
    if not full:
        return f'''<ul class="contact-links"><li><a href="https://github.com/kyrofx">github / kyrofx {ARROW}</a></li><li>{email}</li><li><span>discord / @kyrofx</span></li></ul>'''
    return f'''<dl class="contact-details">
      <div><dt>{c['email']}</dt><dd>{email}{copy}</dd></div>
      <div><dt>github</dt><dd><a href="https://github.com/kyrofx">kyrofx {ARROW}</a></dd></div>
      <div><dt>discord</dt><dd>@kyrofx</dd></div>
    </dl><p class="copy-status" data-copy-status role="status" aria-live="polite"></p>'''


def content(lang, page):
    c = COPY[lang]
    if page == 'index':
        letters = ''.join(f'<span class="letter" data-letter="{char}" style="--i:{i}" aria-hidden="true"><span class="letter-glyph">{char}</span></span>' for i, char in enumerate('kyro'))
        return f'''<div class="nameplate"><h1 class="name" aria-label="Kyro">{letters}</h1></div>
        <div class="home-content">
          <section class="home-projects" aria-labelledby="projects-title">
            <h2 id="projects-title">{c['nav'][1]}</h2>{project_list(PROJECTS[:4], c)}
            <a class="plain-link all-projects" href="{route(lang, 'projects')}">{c['all_projects']} <span aria-hidden="true">→</span></a>
          </section>
          <section class="home-contact" aria-labelledby="contact-title"><h2 id="contact-title">{c['nav'][3]}</h2>{contacts(c)}</section>
        </div>'''
    heading = f'<header class="page-heading"><h1>{c["nav"][PAGES.index(page)]}</h1></header>'
    if page == 'projects':
        return heading + f'<div class="project-index">{project_list(PROJECTS, c)}</div>'
    if page == 'about':
        cuda_count = '20.736' if lang == 'ca' else '20,736'
        return heading + f'''<dl class="about-facts">
            <div><dt>{c['location_label']}</dt><dd>{escape(c['location'])}</dd></div>
            <div><dt>{c['studying']}</dt><dd>{escape(c['studies'])}</dd></div>
            <div><dt>{c['code']}</dt><dd>Rust · TypeScript · Python</dd></div>
            <div><dt>{c['systems']}</dt><dd>{escape(c['systems_value'])}</dd></div>
          </dl>
          <section class="homelab" aria-labelledby="homelab-title">
            <h2 id="homelab-title">{c['homelab']}</h2>
            <dl class="lab-stats">
              <div><dt>RAM</dt><dd>168 <span class="metric-unit">GB</span></dd></div>
              <div><dt>CPU</dt><dd class="cpu-stats"><span>26 <span class="metric-unit">{c['cores']}</span></span><span>34 <span class="metric-unit">{c['threads']}</span></span></dd></div>
              <div><dt>{c['cuda']}</dt><dd>{cuda_count}</dd></div>
              <div><dt>{c['onboard_memory']}</dt><dd>176 <span class="metric-unit">GB</span></dd></div>
            </dl>
          </section>'''
    return heading + contacts(c, full=True)


def render(lang, page):
    c = COPY[lang]
    other = 'en' if lang == 'ca' else 'ca'
    other_path = route(other, page)
    title = 'kyro' if page == 'index' else c['nav'][PAGES.index(page)] + ' / kyro'
    nav_links = []
    for target, label in zip(PAGES[1:], c['nav'][1:]):
        current = ' aria-current="page"' if target == page else ''
        nav_links.append(f'<a href="{route(lang, target)}"{current}>{label}</a>')
    language_links = []
    for code, label, name in [('en', 'EN', 'English'), ('ca', 'CA', 'Català')]:
        current = ' aria-current="true"' if code == lang else ''
        href = route(code, page)
        language_links.append(f'<a href="{href}" lang="{code}" hreflang="{code}" aria-label="{name}"{current}>{label}</a>')
    home_current = ' aria-current="page"' if page == 'index' else ''
    html = f'''<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{EMBED_TEXT}">
  <meta name="theme-color" content="#ffffff">
  <script>
    // Fail open if the enhancement cannot load; the static page remains usable.
    window.asciiBoot = {{ requested: true, interacted: false }};
    for (const type of ['pointerdown', 'keydown', 'wheel']) {{
      document.addEventListener(type, () => {{ window.asciiBoot.interacted = true; }}, {{ once: true, capture: true, passive: true }});
    }}
    if (window.asciiBoot.requested) {{
      document.documentElement.classList.add('ascii-pending', 'ascii-used');
      window.asciiSafetyTimer = setTimeout(() => {{
        document.documentElement.classList.remove('ascii-pending', 'ascii-active');
        document.querySelector('.ascii-screen')?.remove();
        window.dispatchEvent(new Event('ascii:abort'));
        window.dispatchEvent(new Event('ascii:ready'));
      }}, 3500);
    }}
  </script>
  <link rel="canonical" href="{url(lang, page)}">
  <link rel="alternate" hreflang="en" href="{url('en', page)}">
  <link rel="alternate" hreflang="ca" href="{url('ca', page)}">
  <link rel="alternate" hreflang="x-default" href="{url('en', page)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{EMBED_TEXT}">
  <meta property="og:description" content="{EMBED_TEXT}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{EMBED_TEXT}">
  <meta name="twitter:description" content="{EMBED_TEXT}">
  <meta property="og:url" content="{url(lang, page)}">
  <meta property="og:locale" content="{'ca_ES' if lang == 'ca' else 'en_US'}">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/{asset('css/site.css')}">
  <script src="/{asset('js/site.js')}" defer></script>
  <script src="/{asset('js/ascii.js')}" defer></script>
</head>
<body class="page-{page}">
  <a class="skip-link" href="#main">{c['skip']}</a>
  <div class="site">
    <header class="site-header">
      <a class="site-address" href="{route(lang, 'index')}" aria-label="kyro.cat — {c['nav'][0]}"{home_current}>kyro.cat</a>
      <nav class="navigation" aria-label="{c['navigation']}">{''.join(nav_links)}</nav>
      <nav class="language-switch" aria-label="{c['languages']}">{' <span aria-hidden="true">/</span> '.join(language_links)}</nav>
    </header>
    <main id="main" tabindex="-1">{content(lang, page)}</main>
    <footer class="site-footer"><span class="footer-signature">© kyro <span class="pride-mark" role="img" aria-label="{c['pride_label']}"></span></span><button class="replay-intro" type="button" data-ascii-replay aria-label="{c['replay_label']}" hidden>{c['replay']}</button><a href="{other_path}" lang="{other}" hreflang="{other}">{c['foot_language']}</a></footer>
  </div>
</body>
</html>
'''
    return html


def build():
    for lang in COPY:
        directory = ROOT / ('ca' if lang == 'ca' else '')
        directory.mkdir(exist_ok=True)
        for page in PAGES:
            (directory / f'{page}.html').write_text(render(lang, page), encoding='utf-8')
    entries = []
    for lang in COPY:
        for page in PAGES:
            alternates = ''.join(f'<xhtml:link rel="alternate" hreflang="{code}" href="{url(code, page)}"/>' for code in COPY)
            entries.append(f'  <url><loc>{url(lang, page)}</loc>{alternates}</url>')
    (ROOT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + '\n'.join(entries) + '\n</urlset>\n', encoding='utf-8')
    print('Generated 8 pages and sitemap.xml for kyro.cat.')


if __name__ == '__main__':
    build()
