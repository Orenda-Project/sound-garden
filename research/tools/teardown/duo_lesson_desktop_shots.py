import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={"width":1280,"height":800})
        pg=await ctx.new_page()
        await pg.goto("https://www.duolingo.com/register",wait_until="domcontentloaded");await pg.wait_for_timeout(3000)
        await pg.get_by_text("Spanish",exact=True).first.click()
        for i in range(40):
            await pg.wait_for_timeout(2500)
            print(pg.url,flush=True)
            if "/lesson" in pg.url: break
            for t in ["Google Search","Just for fun","I’m new to Spanish","5 min / day","Start from scratch"]:
                l=pg.get_by_text(t,exact=True).first
                if await l.count() and await l.is_visible(): await l.click();break
            c=pg.get_by_role("button",name="Continue").first
            try:
                await pg.wait_for_timeout(1200)
                if await c.count() and await c.is_enabled(): await c.click(timeout=2000)
            except: pass
        await pg.wait_for_timeout(5000)
        for i in range(3):
            for kw in ["Keep going","KEEP GOING"]:
                k=pg.get_by_role("button",name=kw).first
                if await k.count() and await k.is_visible(): await k.click();await pg.wait_for_timeout(1000)
            body=(await pg.inner_text("body"))[:150].replace("\n"," | ")
            print(i,pg.url.split("duolingo.com")[1],body,flush=True)
            await pg.screenshot(path=f"/tmp/sg/dq-{i:02d}a.png")
            for sel in ["[data-test='challenge-choice']","[data-test='challenge-judge-text']","[data-test='challenge-tap-token']","[data-test='word-bank'] button"]:
                loc=pg.locator(sel)
                if await loc.count():
                    try: await loc.first.click(timeout=1500);break
                    except: pass
            await pg.wait_for_timeout(600)
            for name in ["Check","CHECK","Continue","CONTINUE","Got it","GOT IT","Start","START","No thanks","NO THANKS","Skip","Not now"]:
                bt=pg.get_by_role("button",name=name).first
                try:
                    if await bt.count() and await bt.is_visible() and await bt.is_enabled():
                        await bt.click(timeout=1500);break
                except: pass
            await pg.wait_for_timeout(900)
            await pg.screenshot(path=f"/tmp/sg/dq-{i:02d}b.png")
            await pg.wait_for_timeout(1200)
        await b.close()
asyncio.run(main())
