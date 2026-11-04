"""Check public routes, locale relationships, and generated content using the standard library."""
import importlib.util
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import xml.etree.ElementTree as ET

REPO = Path(__file__).resolve().parents[1]
ROOT = REPO / 'public' / 'portfolio'
SPEC = importlib.util.spec_from_file_location('site_builder', REPO / 'scripts/build_site.py')
SITE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SITE)


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class StaticSiteTests(unittest.TestCase):
    def test_all_generated_pages_are_current(self):
        for lang in ['en', 'ca']:
            for page in SITE.PAGES:
                with self.subTest(lang=lang, page=page):
                    path = ROOT / ('ca' if lang == 'ca' else '') / (page + '.html')
                    self.assertEqual(path.read_text(), SITE.render(lang, page))

    def test_local_links_assets_and_fragment_targets_exist(self):
        for path in [*ROOT.glob('*.html'), *ROOT.glob('ca/*.html')]:
            document = Document(path.read_text())
            for tag, attrs in document.tags:
                ref = attrs.get('href') or attrs.get('src')
                if not ref or urlparse(ref).scheme:
                    continue
                parsed = urlparse(ref)
                target = ((ROOT / unquote(parsed.path).lstrip('/')) if parsed.path.startswith('/') else (path.parent / unquote(parsed.path))).resolve() if parsed.path else path
                if target.is_dir():
                    target = target / 'index.html'
                elif not target.suffix:
                    target = target.with_suffix('.html')
                with self.subTest(page=path.name, ref=ref):
                    self.assertTrue(target.is_file(), f'Missing {target}')
                    if parsed.fragment and target.suffix == '.html':
                        ids = [a.get('id') for t, a in Document(target.read_text()).tags]
                        self.assertIn(parsed.fragment, ids)

    def test_public_page_urls_are_clean(self):
        for lang in SITE.COPY:
            for page in SITE.PAGES:
                for tag, attrs in Document(SITE.render(lang, page)).tags:
                    if tag not in ['a', 'link'] or not attrs.get('href'):
                        continue
                    parsed = urlparse(attrs['href'])
                    if parsed.netloc and parsed.netloc != 'kyro.cat':
                        continue
                    self.assertNotIn('.html', parsed.path)
                    self.assertNotIn('/index', parsed.path)

    def test_language_metadata_and_navigation(self):
        for lang in ['en', 'ca']:
            for page in SITE.PAGES:
                doc = Document(SITE.render(lang, page))
                self.assertIn(('html', {'lang': lang}), doc.tags)
                self.assertEqual(len([t for t, _ in doc.tags if t == 'h1']), 1)
                alternatives = {a['hreflang']: a['href'] for t, a in doc.tags if t == 'link' and a.get('rel') == 'alternate'}
                self.assertEqual(alternatives['ca'], SITE.url('ca', page))
                self.assertEqual(alternatives['en'], SITE.url('en', page))
                language_links = [a for t, a in doc.tags if t == 'a' and a.get('hreflang') in ['en', 'ca']]
                self.assertGreaterEqual(len(language_links), 2)
                ids = [a['id'] for t, a in doc.tags if 'id' in a]
                self.assertEqual(len(ids), len(set(ids)))

    def test_sitemap_lists_both_languages(self):
        tree = ET.parse(ROOT / 'sitemap.xml')
        locations = [node.text for node in tree.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
        self.assertEqual(set(locations), {SITE.url(lang, page) for lang in SITE.COPY for page in SITE.PAGES})

    def test_no_promotional_paragraphs_or_old_emblem(self):
        for lang in SITE.COPY:
            for page in SITE.PAGES:
                html = SITE.render(lang, page)
                doc = Document(html)
                for tag, attrs in doc.tags:
                    if tag == 'p':
                        self.assertEqual(attrs.get('role'), 'status')
                self.assertNotIn('eyebrow', html)
                self.assertNotIn('data-dial', html)
                self.assertNotIn('Always curious', html)

    def test_project_links_point_to_the_named_repositories(self):
        html = SITE.render('en', 'projects')
        for name, language in SITE.PROJECTS:
            self.assertIn(f'href="https://github.com/kyrofx/{name}"', html)
            self.assertIn(f'data-language="{language}"', html)


if __name__ == '__main__':
    unittest.main()
