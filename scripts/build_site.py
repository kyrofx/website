"""Generate the static English and Catalan pages: python3 scripts/build_site.py."""
from html import escape
from hashlib import sha256
from pathlib import Path
from urllib.parse import urljoin
import re

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'portfolio'
DOMAIN = 'https://kyro.cat'
EMAIL = 'kyro@kyro.dog'
PAGES = ['index', 'projects', 'about', 'contact']

# Public, non-fork repositories verified against github.com/kyrofx.
# Names and languages are factual; do not add promotional descriptions.
PROJECTS = [
    ('stele', 'TypeScript'),
    ('img-gallery', 'Go'),
    ('mrow-vthax14', 'C++'),
    ('NanoKVM-RemotePowerOn', 'C++'),
    ('BroncoParts', 'Python'),
    ('archiveviewer_int', 'JavaScript'),
    ('CheesyC-public', 'HTML'),
]

COPY = {
    'en': {
        'nav': ['home', 'projects', 'about', 'contact'],
        'navigation': 'Navigation', 'languages': 'Language', 'skip': 'Skip to content',
        'all': 'all', 'all_projects': 'all projects', 'results': 'projects', 'result': 'project',
        'filter': 'Filter projects by language',
        'facts': [
            ('location', 'San Francisco Bay Area, California'),
            ('programming', 'Python, Java, C, PHP, Ruby, JavaScript'),
            ('systems', 'Linux, home lab'),
            ('networking', 'Ubiquiti'),
            ('hardware', 'NVIDIA Jetson, embedded systems'),
        ],
        'email': 'email', 'copy': 'copy', 'copied': 'copied', 'copy_label': 'Copy email address',
        'copy_success': 'Email address copied.',
        'copy_failure': 'Copy unavailable. Select the email address to copy it.',
        'source': 'source',
        'replay': 'replay intro', 'replay_label': 'Replay the ASCII intro animation',
        'description': 'Kyro. Projects, contact details, and GitHub repositories.',
        'foot_language': 'Català',
    },
    'ca': {
        'nav': ['inici', 'projectes', 'sobre mi', 'contacte'],
        'navigation': 'Navegació', 'languages': 'Llengua', 'skip': 'Ves al contingut',
        'all': 'tots', 'all_projects': 'tots els projectes', 'results': 'projectes', 'result': 'projecte',
        'filter': 'Filtra els projectes per llenguatge',
        'facts': [
            ('ubicació', 'Badia de San Francisco, Califòrnia'),
            ('programació', 'Python, Java, C, PHP, Ruby, JavaScript'),
            ('sistemes', 'Linux, laboratori domèstic'),
            ('xarxes', 'Ubiquiti'),
            ('maquinari', 'NVIDIA Jetson, sistemes encastats'),
        ],
        'email': 'correu', 'copy': 'copia', 'copied': 'copiat', 'copy_label': 'Copia l’adreça de correu',
        'copy_success': 'Adreça de correu copiada.',
        'copy_failure': 'No s’ha pogut copiar. Selecciona l’adreça de correu per copiar-la.',
        'source': 'codi font',
        'replay': 'repeteix', 'replay_label': 'Repeteix l’animació d’introducció ASCII',
        'description': 'Kyro. Projectes, dades de contacte i repositoris de GitHub.',
        'foot_language': 'English',
    },
}

ARROW = '<svg class="arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10" stroke="currentColor" stroke-width="1.5"/></svg>'


def asset(path):
    return f'{path}?v={sha256((ROOT / path).read_bytes()).hexdigest()[:10]}'


def url(lang, page):
    if lang == 'ca' and page == 'index':
        return DOMAIN + '/ca'
    return f'{DOMAIN}/{"ca/" if lang == "ca" else ""}{"" if page == "index" else page + ".html"}'


def project_list(projects):
    rows = []
    for name, language in projects:
        rows.append(f'''<li class="project" data-language="{language}">
          <a href="https://github.com/kyrofx/{name}"><span class="project-name">{name}</span><span class="project-language">{language}</span>{ARROW}</a>
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
            <h2 id="projects-title">{c['nav'][1]}</h2>{project_list(PROJECTS[:4])}
            <a class="plain-link all-projects" href="projects.html">{c['all_projects']} <span aria-hidden="true">→</span></a>
          </section>
          <section class="home-contact" aria-labelledby="contact-title"><h2 id="contact-title">{c['nav'][3]}</h2>{contacts(c)}</section>
        </div>'''
    heading = f'<header class="page-heading"><h1>{c["nav"][PAGES.index(page)]}</h1></header>'
    if page == 'projects':
        options = ['all'] + list(dict.fromkeys(language for _, language in PROJECTS))
        buttons = ''.join(f'<button type="button" data-filter="{language}" aria-pressed="{str(language == "all").lower()}">{c["all"] if language == "all" else language}</button>' for language in options)
        return heading + f'''<div class="project-filters" role="group" aria-label="{c['filter']}" hidden>{buttons}</div>
          <div class="project-index">{project_list(PROJECTS)}</div>
          <div class="project-bottom"><a class="plain-link" href="https://github.com/kyrofx?tab=repositories">github / kyrofx {ARROW}</a>
          <span class="filter-status" data-filter-status data-noun="{c['results']}" data-singular="{c['result']}" role="status" aria-live="polite"></span></div>'''
    if page == 'about':
        facts = ''.join(f'<div><dt>{label}</dt><dd>{escape(value)}</dd></div>' for label, value in c['facts'])
        return heading + f'<dl class="facts">{facts}</dl>'
    return heading + contacts(c, full=True)


def render(lang, page):
    c = COPY[lang]
    prefix = '../' if lang == 'ca' else ''
    other = 'en' if lang == 'ca' else 'ca'
    other_path = f'{"../" if lang == "ca" else "ca/"}{page}.html'
    title = 'kyro' if page == 'index' else c['nav'][PAGES.index(page)] + ' / kyro'
    nav_links = []
    for route, label in zip(PAGES[1:], c['nav'][1:]):
        current = ' aria-current="page"' if route == page else ''
        nav_links.append(f'<a href="{route}.html"{current}>{label}</a>')
    language_links = []
    for code, label, name in [('en', 'EN', 'English'), ('ca', 'CA', 'Català')]:
        current = ' aria-current="true"' if code == lang else ''
        href = page + '.html' if code == lang else other_path
        language_links.append(f'<a href="{href}" lang="{code}" hreflang="{code}" aria-label="{name}"{current}>{label}</a>')
    home_current = ' aria-current="page"' if page == 'index' else ''
    html = f'''<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{c['description']}">
  <meta name="theme-color" content="#ffffff">
  <script>
    // Fail open if the enhancement cannot load; the static page remains usable.
    window.asciiBoot = {{ requested: !matchMedia('(prefers-reduced-motion: reduce)').matches, interacted: false }};
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
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{c['description']}">
  <meta property="og:url" content="{url(lang, page)}">
  <meta property="og:locale" content="{'ca_ES' if lang == 'ca' else 'en_US'}">
  <link rel="icon" href="{prefix}img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="{prefix}{asset('css/site.css')}">
  <script src="{prefix}{asset('js/site.js')}" defer></script>
  <script src="{prefix}{asset('js/ascii.js')}" defer></script>
</head>
<body class="page-{page}">
  <a class="skip-link" href="#main">{c['skip']}</a>
  <div class="site">
    <header class="site-header">
      <a class="site-address" href="index.html" aria-label="kyro.cat — {c['nav'][0]}"{home_current}>kyro.cat</a>
      <nav class="navigation" aria-label="{c['navigation']}">{''.join(nav_links)}</nav>
      <nav class="language-switch" aria-label="{c['languages']}">{' <span aria-hidden="true">/</span> '.join(language_links)}</nav>
    </header>
    <main id="main" tabindex="-1">{content(lang, page)}</main>
    <footer class="site-footer"><span>© kyro</span><button class="replay-intro" type="button" data-ascii-replay aria-label="{c['replay_label']}" hidden>{c['replay']}</button><a href="https://github.com/kyrofx/website">{c['source']} {ARROW}</a><a href="{other_path}" lang="{other}" hreflang="{other}">{c['foot_language']}</a></footer>
  </div>
</body>
</html>
'''
    # Absolute local URLs also work at Next's slashless /ca entry route.
    base = '/ca/' if lang == 'ca' else '/'
    return re.sub(r'(href|src)="([^"]+)"',
                  lambda match: match.group(0) if match.group(2).startswith('#')
                  else f'{match.group(1)}="{urljoin(base, match.group(2))}"', html)


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
