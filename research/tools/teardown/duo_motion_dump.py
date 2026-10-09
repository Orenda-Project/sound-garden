"""Duolingo guest flow (Spanish, 390x844): dumps computed transitions/animations, canvas count,
and wall-clock time from clicking GET STARTED-equivalent (/register) to the first challenge.
Usage: python3 duo_motion_dump.py > motion_dump.json"""
import asyncio,json,time,datetime
from playwright.async_api import async_playwright
JS="""()=>{const out={trans:{},kf:[],canvas:document.querySelectorAll('canvas').length,video:document.querySelectorAll('video').length};
for(const e of document.querySelectorAll('*')){const c=getComputedStyle(e);if(c.transitionDuration!=='0s'){const k=c.transitionProperty+' '+c.transitionDuration+' '+c.transitionTimingFunction;out.trans[k]=(out.trans[k]||0)+1}
if(c.animationName!=='none'){out.kf.push(c.animationName+' '+c.animationDuration+' '+c.animationTimingFunction+' '+c.animationIterationCount)}}
out.kf=[...new Set(out.kf)];return out}"""
async def main():
    res={"captured_at":datetime.datetime.now().astimezone().isoformat()}
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={"width":390,"height":844},is_mobile=True)
        pg=await ctx.new_page()
        await pg.goto("https://www.duolingo.com/register",wait_until="domcontentloaded");await pg.wait_for_timeout(3000)
        res["register"]=await pg.evaluate(JS)
        t0=time.time()
        await pg.get_by_text("Spanish",exact=True).first.click();await pg.wait_for_timeout(5000)
        res["welcome"]=await pg.evaluate(JS)
        steps=set()
        for i in range(40):
            await pg.wait_for_timeout(2300)
            steps.add(pg.url.split("duolingo.com")[1])
            if "/lesson" in pg.url: break
            for t in ["Google Search","Just for fun","I’m new to Spanish","5 min / day","Start from scratch"]:
                l=pg.get_by_text(t,exact=True).first
                if await l.count() and await l.is_visible(): await l.click();break
            c=pg.get_by_role("button",name="Continue").first
            try:
                await pg.wait_for_timeout(1200)
                if await c.count() and await c.is_enabled(): await c.click(timeout=2000)
            except: pass
        await pg.locator("[data-test='challenge-choice']").first.wait_for(timeout=30000)
        res["seconds_pick_language_to_first_challenge_scripted"]=round(time.time()-t0,1)
        res["welcome_step_urls"]=sorted(steps)
        res["lesson"]=await pg.evaluate(JS)
        await pg.locator("[data-test='challenge-choice']").first.click()
        await pg.get_by_role("button",name="Check").first.click();await pg.wait_for_timeout(300)
        res["feedback"]=await pg.evaluate(JS)
        await b.close()
    print(json.dumps(res,indent=1))
asyncio.run(main())
