"""Exercise loading, document transitions, history, and failure recovery."""
from functools import partial
import os
from http.server import ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright, expect
from browser_smoke import QuietHandler, ROOT


def check():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = os.environ.get('PORTFOLIO_BASE_URL', f'http://127.0.0.1:{server.server_port}/').rstrip('/') + '/'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
            context = browser.new_context(viewport={'width': 1280, 'height': 900})
            phases, errors = [], []
            context.expose_function('recordAsciiPhase', lambda phase: phases.append(phase))
            context.add_init_script('''new MutationObserver(records => {
              for (const record of records) for (const node of record.addedNodes) {
                if (node.classList?.contains('ascii-screen')) window.recordAsciiPhase(node.dataset.phase);
              }
            }).observe(document, {subtree: true, childList: true});''')
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base, wait_until='domcontentloaded')
            expect(page.locator('.ascii-screen[data-phase="enter"]')).to_have_count(1)
            assert page.locator('.ascii-screen').evaluate('''canvas => {
              const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
              let ink = 0;
              for (let i = 0; i < data.length; i += 4) if (data[i] < 180 && data[i + 3] > 150) ink++;
              return ink > 100;
            }''')
            expect(page.locator('.ascii-screen')).to_have_count(0, timeout=3000)
            expect(page.locator('.site')).to_have_css('opacity', '1')
            print('PASS: initial ASCII paint contains characters and resolves to visible HTML')

            page.locator('.navigation a[href$="/projects.html"]').click()
            expect(page).to_have_url(base + 'projects.html')
            expect(page.locator('.ascii-screen')).to_have_count(0, timeout=1800)
            assert 'leave' in phases and phases.count('enter') >= 2, phases
            page.locator('.language-switch a[lang="ca"]').click()
            expect(page).to_have_url(base + 'ca/projects.html')
            expect(page.locator('html')).to_have_attribute('lang', 'ca')
            page.go_back()
            expect(page).to_have_url(base + 'projects.html')
            expect(page.locator('.ascii-screen')).to_have_count(0)
            page.locator('.navigation a[href$="/about.html"]').click()
            expect(page).to_have_url(base + 'about.html')
            print('PASS: outgoing/incoming transitions, language links, and navigation after back')

            page.goto(base, wait_until='domcontentloaded')
            page.keyboard.press('Escape')
            page.evaluate("document.querySelector('.navigation a[href$=\"/projects.html\"]').click()")
            page.keyboard.press('Escape')
            expect(page.locator('.ascii-screen')).to_have_count(0)
            expect(page).to_have_url(base)
            page.locator('.navigation a[href$="/about.html"]').click()
            expect(page).to_have_url(base + 'about.html')
            print('PASS: cancelling an outgoing animation leaves navigation usable')

            page.goto(base, wait_until='domcontentloaded')
            page.keyboard.press('Escape')
            expect(page.locator('.ascii-screen')).to_have_count(0)
            expect(page.locator('.site')).to_have_css('opacity', '1')
            page.reload(wait_until='domcontentloaded')
            page.mouse.click(10, 10)
            expect(page.locator('.ascii-screen')).to_have_count(0)
            page.reload(wait_until='domcontentloaded')
            page.set_viewport_size({'width': 390, 'height': 844})
            expect(page.locator('.ascii-screen')).to_have_count(0)
            page.reload(wait_until='domcontentloaded')
            page.emulate_media(reduced_motion='reduce')
            expect(page.locator('.ascii-screen')).to_have_count(0)
            page.reload(wait_until='domcontentloaded')
            expect(page.locator('.ascii-screen')).to_have_count(0)
            expect(page.locator('.site')).to_have_css('opacity', '1')
            print('PASS: interaction, resize, and reduced motion skip safely')

            unavailable = context.new_page()
            unavailable.add_init_script('HTMLCanvasElement.prototype.getContext = () => null;')
            unavailable.goto(base)
            expect(unavailable.locator('.ascii-screen')).to_have_count(0)
            expect(unavailable.locator('.site')).to_have_css('opacity', '1')
            unavailable.locator('.navigation a[href$="/contact.html"]').click()
            expect(unavailable).to_have_url(base + 'contact.html')

            blocked = context.new_page()
            blocked.route('**/js/ascii.js', lambda route: route.abort())
            blocked.goto(base, wait_until='domcontentloaded')
            expect(blocked.locator('.site')).to_have_css('opacity', '1', timeout=4500)
            expect(blocked.locator('.ascii-screen')).to_have_count(0)
            print('PASS: missing canvas and blocked renderer fail open')
            assert not errors, errors
            browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    check()
