import asyncio
from playwright.async_api import async_playwright
async def go(tag,w,h,b):
    ctx=await b.new_context(viewport={"width":w,"height":h},is_mobile=(tag=="m"))
    pg=await ctx.new_page()
    await pg.goto("https://www.teachyourmonster.org/account/play/tm123/go",wait_until="domcontentloaded");await pg.wait_for_timeout(8000)
    print(tag,pg.url,(await pg.inner_text("body"))[:300].replace("\n"," | "))
    await pg.screenshot(path=f"/tmp/sg/tp-{tag}-1.png")
    await pg.wait_for_timeout(8000)
    await pg.screenshot(path=f"/tmp/sg/tp-{tag}-2.png")
    # canvas?
    print("canvas",await pg.locator("canvas").count(),"iframes",await pg.locator("iframe").count())
    await ctx.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        await go("d",1280,800,b);await go("m",390,844,b)
        await b.close()
asyncio.run(main())
