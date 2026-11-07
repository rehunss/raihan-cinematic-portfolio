import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const content=JSON.parse(readFileSync(new URL('../src/content.json',import.meta.url),'utf8')) as typeof import('../src/content.json');
const sizes=[{width:390,height:844},{width:768,height:1024},{width:1440,height:900},{width:1920,height:1080}];
for(const size of sizes){
 test(`${size.width}x${size.height}: complete layout, assets, access and screenshots`,async({page})=>{
   await page.setViewportSize(size);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   const failures:string[]=[];page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
   await page.goto('./');await expect(page.locator('h1')).toContainText(/Raihan\s*Ramadhan/);await expect(page.locator('html')).toHaveAttribute('data-motion','off');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);expect(overflow).toBe(false);
   await page.evaluate(async()=>{
     const visible = [...document.images].filter(image => image.getBoundingClientRect().width > 0);
     for (const image of visible) image.loading = 'eager';
     await Promise.all(visible.map(image => image.decode().catch(() => {})));
     scrollTo(0, 0);
   });
   const broken=await page.locator('main img').evaluateAll(imgs=>imgs.filter(i=>!(i as HTMLImageElement).naturalWidth).filter(i=>i.getBoundingClientRect().width>0).map(i=>(i as HTMLImageElement).src));expect(broken).toEqual([]);
   const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
   mkdirSync('qa',{recursive:true});writeFileSync(`qa/axe-${size.width}.json`,JSON.stringify(a11y.violations,null,2));expect(a11y.violations).toEqual([]);
   await page.screenshot({path:`qa/final-${size.width}-hero.png`});await page.screenshot({path:`qa/final-${size.width}-full.png`,fullPage:true});
   for(const id of ['divia','tiriz','experience','skills','contact']){await page.locator(`#${id}`).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:`qa/final-${size.width}-${id}.png`});}
   await expect(page.locator('#fikomnex .experience-highlights .metric')).toHaveCount(2);
   const pics=await page.locator('.experience-photo img').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().width));for(const width of pics)expect(width).toBeGreaterThan(size.width<768?size.width-60:320);
   expect(errors).toEqual([]);expect(failures).toEqual([]);
 });
}
test('navigation deep links, refresh, Back and Forward',async({page})=>{
 await page.goto('./');await page.locator('#projects a[href="#divia"]').click();await expect(page).toHaveURL(/#divia$/);await expect(page.locator('#divia')).toBeInViewport();await page.reload();await expect(page.locator('#divia')).toBeInViewport();
 await page.locator('.world-nav a[href="#experience"]').click();await expect(page).toHaveURL(/#experience$/);await page.goBack();await expect(page).toHaveURL(/#divia$/);await expect(page.locator('#divia')).toBeInViewport();await page.goForward();await expect(page).toHaveURL(/#experience$/);await expect(page.locator('#experience')).toBeInViewport();
});
test('mobile menu, keyboard Escape, navigation and touch targets',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('./');const menu=page.locator('.world-menu');await menu.click();await expect(menu).toHaveAttribute('aria-expanded','true');await page.keyboard.press('Escape');await expect(menu).toBeFocused();await expect(menu).toHaveAttribute('aria-expanded','false');
 await menu.click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Experience',exact:true}).click();await expect(page).toHaveURL(/#experience$/);await expect(menu).toHaveAttribute('aria-expanded','false');
 const targets=await page.locator('button,a,summary').evaluateAll(els=>els.filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).map(e=>({text:e.textContent?.trim(),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})).filter(e=>e.h<43.5));expect(targets).toEqual([]);
});
test('skip link and unobscured keyboard focus',async({page})=>{
 await page.goto('./');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();await page.keyboard.press('Enter');await expect(page).toHaveURL(/#main$/);await page.keyboard.press('Tab');
 const focused=await page.evaluate(()=>{const e=document.activeElement as HTMLElement;const r=e.getBoundingClientRect();return {outline:getComputedStyle(e).outlineStyle,y:r.top,bottom:r.bottom};});expect(focused.outline).not.toBe('none');expect(focused.y).toBeGreaterThanOrEqual(63);
});
for(const width of [390,1440])test(`${width}: proof dialog focus trap, Escape, return and full-size files`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('./');await page.locator('#divia').scrollIntoViewIfNeeded();const trigger=page.locator('#divia .project-story').getByRole('button',{name:'View project proof'});await trigger.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(page.getByRole('button',{name:'Close proof'})).toBeFocused();
 const focusables=dialog.locator('a,button');const count=await focusables.count();for(let i=0;i<count+3;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>document.querySelector('dialog')?.contains(document.activeElement))).toBe(true);}
 const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(a11y.violations).toEqual([]);
 const img=await dialog.locator('img').getAttribute('src');expect((await page.request.get(img!)).status()).toBe(200);await page.screenshot({path:`qa/dialog-${width}.png`});await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();
 for(const id of ['fikomnex','hima','bem','theatre','ideation']){const trigger=page.locator(`#${id} .media-proof`);await trigger.click();await expect(dialog).toBeVisible();await expect(dialog.locator('img')).toHaveAttribute('src',new RegExp(content.sources.find(s=>s.id===id)!.file));await page.getByRole('button',{name:'Close proof'}).click();await expect(trigger).toBeFocused();}
});
test('Divia platform tabs, exact values, tooltip, keyboard and URL restoration',async({page})=>{
 await page.goto('./#divia');const panel=page.locator('.platform-chart');await panel.getByRole('tab',{name:'TikTok',exact:true}).click();await expect(panel).toContainText('4,427');await expect(panel).toContainText('+417');await expect(panel).toContainText('+31.5%');await expect(panel).toContainText('It does not measure total-follower growth');
 await panel.getByRole('tab',{name:'TikTok',exact:true}).focus();await page.keyboard.press('ArrowRight');await expect(panel.getByRole('tab',{name:'LinkedIn'})).toHaveAttribute('aria-selected','true');await expect(panel).toContainText('65.0%');await expect(panel).toContainText('104');await expect(panel).toContainText('160');await page.reload();await expect(panel.getByRole('tab',{name:'LinkedIn'})).toHaveAttribute('aria-selected','true');
 await page.goBack();await expect(panel.getByRole('tab',{name:'TikTok'})).toHaveAttribute('aria-selected','true');await panel.locator('.metric-control').first().focus();await expect(panel.locator('.metric-detail')).toBeVisible();await panel.locator('.metric-control').first().click();await panel.getByText('View data table',{exact:true}).click();await expect(panel.locator('table')).toBeVisible();
 await panel.getByRole('tab',{name:'Instagram',exact:true}).click();for(const x of ['22K','11K','133','78'])await expect(panel).toContainText(x);
 const posts=page.locator('.post-results');await expect(posts).toContainText('snapshot August 12, 2026');
 for(const c of content.diviaPostCases.cases){for(const p of c.platforms){const cover=posts.getByRole('link',{name:`View ${c.name} on ${p.name}`,exact:true});await expect(cover).toHaveAttribute('href',p.cover.postUrl);await cover.scrollIntoViewIfNeeded();await expect(cover.locator('img')).toBeVisible();await expect.poll(()=>cover.locator('img').evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBe(p.cover.width);}}
 const transport=posts.locator('.post-case-transport');for(const value of ['9,898','180','104'])await expect(transport).toContainText(value);
 const tour=posts.locator('.post-case-tour');for(const value of ['9,745','18','3,765','2,471','6'])await expect(tour).toContainText(value);
 const trigger=transport.getByRole('button',{name:'View TikTok post analytics'});await trigger.click();const dialog=page.getByRole('dialog');await expect(dialog).toContainText('July 27, 2026');await expect(dialog).toContainText('August 11');await expect(dialog.locator('.proof-excerpt')).toContainText('180');const excerptA11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(excerptA11y.violations).toEqual([]);await expect(dialog.getByRole('link',{name:'Open metric excerpt'})).toHaveAttribute('href',/divia-transport-tiktok-aug12.html$/);await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
 await panel.getByRole('tab',{name:'TikTok',exact:true}).click();await expect(panel).toContainText('401.1K');await expect(panel).toContainText('3.1K');await expect(panel).toContainText('20.0% lower');for(const evidence of content.sources.filter(x=>'metricIds' in x)){const response=await page.request.get(evidence.file);expect(response.status()).toBe(200);expect(await response.text()).toMatch(/team\/account/i);}

});
test('TIRIZ target and actual, separate scales, missed target, tap and table',async({page})=>{
 await page.goto('./#tiriz');const panel=page.locator('.tiriz-chart');await expect(panel).toContainText('814.1');await expect(panel).toContainText('81.41%');await expect(panel).toContainText('Below target');await expect(panel).toContainText('185.9 accounts');
 await panel.locator('.comparison-row').last().click();await expect(panel.getByRole('status')).toContainText('814.1');
 await panel.getByRole('tab',{name:'Stories',exact:true}).click();await expect(panel).toContainText('300% of target');await expect(panel.locator('.comparison-row').first()).toContainText('40');await expect(panel.locator('.comparison-row').last()).toContainText('120');
 await panel.getByRole('tab',{name:'Videos',exact:true}).click();await expect(panel).toContainText('200% of target');await panel.getByRole('tab',{name:'Creator views'}).click();await expect(panel).toContainText('1,725.6%');await expect(panel).toContainText('1,625.6% above target');await panel.getByText('View data table',{exact:true}).click();await expect(panel.locator('table')).toContainText('accounts reached per feed post');
 await page.reload();await expect(panel.getByRole('tab',{name:'Creator views'})).toHaveAttribute('aria-selected','true');
});
test('age composition exact values, hover, focus, tap and table',async({page})=>{
 await page.goto('./#divia');const panel=page.locator('.age-chart');await expect(panel).toContainText('followers, not all viewers');const rows=panel.locator('.age-row');expect(await rows.count()).toBe(7);for(let i=0;i<7;i++)await expect(rows.nth(i)).toContainText(content.audience.rows[i].value.toFixed(1)+'%');await rows.nth(1).hover();await expect(panel.getByRole('status')).toContainText('54.0%');await rows.nth(2).focus();await expect(panel.getByRole('status')).toContainText('28.2%');await rows.nth(2).click();await rows.nth(2).click();await expect(panel.getByRole('status')).toContainText('28.2%');await panel.getByText('View data table',{exact:true}).click();await expect(panel.locator('table')).toBeVisible();
});
test('motion preference persistence and system reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('./');const toggle=page.getByRole('button',{name:'Motion on'});await expect(toggle).toHaveAttribute('aria-pressed','true');await toggle.click();await expect(page.getByRole('button',{name:'Motion off'})).toHaveAttribute('aria-pressed','false');await page.reload();await expect(page.getByRole('button',{name:'Motion off'})).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('raihan-motion'))).toBe('off');
 await page.getByRole('button',{name:'Motion off'}).click();await page.emulateMedia({reducedMotion:'reduce'});await expect(page.getByRole('button',{name:'Motion off'})).toHaveAttribute('aria-pressed','false');await expect(page.locator('html')).toHaveAttribute('data-motion','off');expect(await page.locator('#projects .shot-caption').evaluate(e=>getComputedStyle(e).opacity)).toBe('1');
});
test('document responses, real contents, originals unchanged, desktop and mobile anchors',async({page,request})=>{
 for(const [file,sha256] of [['CV_Raihan.pdf','40c98d26bb310d6ef57ed5669e2fa7c7fffffa900602957d017a684f7157818f'],['TIRIZ_Laporan_Kampanye.pdf','63cbcaa9cf99cd0acc600f56471456061f01c32727ddf610021ac3cbbba923a5']]){const res=await request.get(`documents/${file}`);expect(res.status()).toBe(200);const body=await res.body();expect(body.subarray(0,5).toString()).toBe('%PDF-');expect(createHash('sha256').update(body).digest('hex')).toBe(sha256);}
 const res=await request.get('documents/Raihan_Signals_in_Motion_Portfolio.pdf');expect(res.status()).toBe(200);expect((await res.body()).subarray(0,5).toString()).toBe('%PDF-');
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});await page.goto('./');for(const file of ['CV_Raihan.pdf','Raihan_Signals_in_Motion_Portfolio.pdf','TIRIZ_Laporan_Kampanye.pdf']){const a=page.locator(`a[href$="${file}"]`).first();await expect(a).toHaveAttribute('target','_blank');expect(new URL((await a.getAttribute('href'))!,page.url()).pathname).toBe(`/raihan-cinematic-portfolio/documents/${file}`);}}
});
test('shared PDF content, ten pages, public links and no footer collisions',async({page})=>{
 await page.setViewportSize({width:1123,height:794});await page.goto('./?print=1');const pages=page.locator('.pdf-page');await expect(pages).toHaveCount(10);await page.evaluate(()=>document.fonts.ready);
 const covers=page.locator('.pdf-post-covers img');await expect(covers).toHaveCount(5);await covers.evaluateAll(async imgs=>Promise.all(imgs.map(img=>(img as HTMLImageElement).decode())));
 for(let i=0;i<10;i++){const p=pages.nth(i);const collision=await p.evaluate(el=>{const footer=el.querySelector('.pdf-footer')!.getBoundingClientRect();return [...el.children].filter(c=>!c.classList.contains('pdf-footer')).some(c=>c.getBoundingClientRect().bottom>footer.top-8);});expect(collision,`PDF page ${i+1} touches footer`).toBe(false);}
 for(const p of content.projects)await expect(page.locator('.pdf-document')).toContainText(p.narrative);for(const e of content.experience){await expect(page.locator('.pdf-document')).toContainText(e.context);await expect(page.locator('.pdf-document')).toContainText(e.result);}
 const hrefs=await page.locator('.pdf-document a').evaluateAll(as=>as.map(a=>(a as HTMLAnchorElement).href));expect(hrefs.some(h=>h.includes('localhost')||h.includes('127.0.0.1'))).toBe(false);expect(hrefs).toContain(content.settings.publicSiteUrl);
});

test('follow-up evidence separates account reach from authored work and reports the exact leadership measures', async ({ page }) => {
  await page.goto('./#cakradata');
  const work = page.locator('#cakradata .published-samples');
  await expect(work).toContainText('Nov 6, 2026');
  const samples = work.getByRole('listitem');
  await expect(samples).toHaveCount(3);
  await expect(samples.nth(0)).toContainText('5,263 views');
  await expect(samples.nth(1)).toContainText('2,701 views');
  await expect(samples.nth(2)).toContainText('13K views · Separate Techno Campus account post');
  await expect(samples.nth(1).getByRole('link')).toHaveAttribute('href', /\/reel\/DFff18Cz_Xs\/$/);
  await expect(page.locator('#hima')).toContainText('81 registrations out of 92 new members');
  await expect(page.locator('#bem')).toContainText('attendance threshold of at least 50%');
});
