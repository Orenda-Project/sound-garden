"""Imported first by every copied Sound Out driver: the app lives at '#/play' on Sound Garden, so a bare goto(root) means goto(root#/play)."""
import re
from playwright.sync_api import Page
_goto = Page.goto
def goto(self, url, *a, **k):
    if re.match(r'^https?://[^/]+/?(\?[^#]*)?$', url): url = url + ('' if url.endswith('/') and '?' not in url else '') + '#/play'
    return _goto(self, url, *a, **k)
Page.goto = goto
