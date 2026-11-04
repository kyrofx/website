"""Optional browser checks. Requires Python Playwright and /usr/bin/chromium.

Run from the repository root: python3 tests/browser_smoke.py
Starts its own temporary local server and writes screenshots under /tmp.
"""
from functools import partial
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'portfolio'


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def check():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = os.environ.get('PORTFOLIO_BASE_URL', f'http://127.0.0.1:{server.server_port}/').rstrip('/') + '/'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
            context = browser.new_context(permissions=['clipboard-read', 'clipboard-write'])
            page = context.new_page()
            errors, bad_responses = [], []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('response', lambda response: bad_responses.append(response.url) if response.status >= 400 else None)

            for width in [1440, 768, 390, 320]:
                page.set_viewport_size({'width': width, 'height': 1000})
                for locale in ['', 'ca/']:
                    for route in ['index', 'projects', 'about', 'contact']:
                        response = page.goto(base + locale + route + '.html', wait_until='networkidle')
                        assert response.status == 200
                        expect(page.locator('h1')).to_be_visible()
                        expect(page.locator('html')).to_have_attribute('lang', 'ca' if locale else 'en')
                        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, locale, route)
                print(f'PASS: all eight pages at {width}px')

            page.set_viewport_size({'width': 1440, 'height': 1050})
            page.goto(base)
            page.keyboard.press('Tab')
            expect(page.locator('.skip-link')).to_be_focused()
            page.keyboard.press('Enter')
            expect(page.locator('main')).to_be_focused()
            page.locator('.navigation a[href$="/projects.html"]').click()
            expect(page.locator('.project:visible')).to_have_count(7)
            page.locator('[data-filter="C++"]').click()
            expect(page.locator('.project:visible')).to_have_count(2)
            expect(page.locator('[data-filter-status]')).to_have_text('2 projects')
            page.locator('[data-filter="all"]').focus()
            page.keyboard.press('Space')
            expect(page.locator('.project:visible')).to_have_count(7)
            page.locator('.language-switch a[lang="ca"]').click()
            expect(page).to_have_url(base + 'ca/projects.html')
            page.locator('[data-filter="Go"]').click()
            expect(page.locator('.project:visible')).to_have_count(1)
            expect(page.locator('[data-filter-status]')).to_have_text('1 projecte')
            print('PASS: skip link, keyboard navigation, filters, and equivalent-language links')

            page.goto(base + 'ca/contact.html')
            page.locator('[data-copy]').click()
            expect(page.locator('[data-copy-status]')).to_have_text('Adreça de correu copiada.')
            assert page.evaluate('navigator.clipboard.readText()') == 'kyro@kyro.dog'
            page.evaluate("() => { navigator.clipboard.writeText = async () => { throw new Error('denied'); }; }")
            page.locator('[data-copy]').click()
            expect(page.locator('[data-copy-status]')).to_contain_text('No s’ha pogut copiar')
            print('PASS: clipboard success and failure feedback')

            page.goto(base, wait_until='networkidle')
            expect(page.locator('.ascii-screen')).to_have_count(0)
            page.screenshot(path='/tmp/kyro-revision-desktop.png', full_page=True)
            letter = page.locator('.letter').nth(1)
            letter.hover()
            page.wait_for_function("parseFloat(document.querySelectorAll('.letter')[1].style.getPropertyValue('--letter-y')) < -3")
            expect(letter).to_have_class('letter is-near')
            page.mouse.move(0, 0)
            page.wait_for_function("[...document.querySelectorAll('.letter')].every(el => Math.abs(parseFloat(el.style.getPropertyValue('--letter-y'))) < .03)")
            page.locator('.navigation a').first.hover()
            expect(page.locator('.nav-indicator')).to_have_css('opacity', '1')
            expect(page.locator('.navigation a').first).to_have_class('is-highlighted')
            page.locator('.navigation a').nth(1).focus()
            expect(page.locator('.navigation a').nth(1)).to_have_class('is-highlighted')
            print('PASS: spring typography settles, navigation highlight follows pointer and focus')
            page.locator('.project a').first.hover()
            expect(page.locator('.project a').first).to_have_css('color', 'rgb(255, 255, 255)')
            page.emulate_media(reduced_motion='reduce')
            assert page.locator('.letter-glyph').first.evaluate('(el) => getComputedStyle(el).animationName') == 'none'
            assert page.locator('.project-name').first.evaluate('(el) => getComputedStyle(el).transitionDuration') == '0s'
            expect(page.locator('.name')).not_to_have_class('name is-kinetic')
            page.wait_for_function("document.getAnimations().length === 0")
            page.set_viewport_size({'width': 390, 'height': 844})
            page.goto(base, wait_until='networkidle')
            page.mouse.move(0, 0)
            page.screenshot(path='/tmp/kyro-revision-mobile.png', full_page=True)
            print('PASS: hover treatment and reduced motion')

            nojs = browser.new_context(java_script_enabled=False)
            tab = nojs.new_page()
            tab.goto(base + 'ca/projects.html')
            expect(tab.locator('.project:visible')).to_have_count(7)
            expect(tab.locator('.project-filters')).to_be_hidden()
            tab.locator('.navigation a[href$="/contact.html"]').click()
            expect(tab.locator('[data-copy]')).to_be_hidden()
            expect(tab.locator('a[href="mailto:kyro@kyro.dog"]')).to_be_visible()
            print('PASS: content, navigation, projects, and email without JavaScript')
            assert not errors, errors
            assert not bad_responses, bad_responses
            browser.close()
            print('PASS: no JavaScript errors or failed asset requests')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    check()
