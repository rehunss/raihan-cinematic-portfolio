import { expect, test, type Page } from '@playwright/test';

const stopIds = ['profile', 'about', 'projects', 'work-tiriz', 'work-cakradata', 'experience', 'impact', 'contact'];
const readyCanvas = '.film-live[data-ready=true] canvas';

async function pose(page: Page) {
  const raw = await page.locator(readyCanvas).getAttribute('data-camera-pose');
  return JSON.parse(raw!) as { position: number[]; target: number[]; quaternion: number[] };
}

async function moveTo(page: Page, top: number) {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), top);
}

async function stopAt(page: Page, id: string) {
  await page.locator('#' + id).evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
  await expect(page.locator('.cinematic')).toHaveAttribute('data-shot', id);
}

test('the persistent canvas travels, holds and reverses across eight shots', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('./?debug-world=1');
  const canvas = page.locator(readyCanvas);
  await expect(canvas).toBeVisible({ timeout: 30_000 });
  await canvas.evaluate(el => { el.dataset.instance = 'original'; });
  const start = await pose(page);
  const aboutTop = await page.locator('#about').evaluate(el => el.getBoundingClientRect().top + scrollY);
  await moveTo(page, aboutTop * .3);
  await expect.poll(() => pose(page)).not.toEqual(start);
  const paused = await pose(page);
  await page.waitForTimeout(300);
  expect(await pose(page)).toEqual(paused);

  const positions: number[] = [];
  for (const id of stopIds) {
    await stopAt(page, id);
    await page.screenshot({ path: 'qa/film-live-' + id + '.png' });
    positions.push((await pose(page)).position[2]);
    await expect(canvas).toHaveAttribute('data-instance', 'original');
  }
  expect(new Set(positions).size).toBe(stopIds.length);
  expect(positions.at(-1)!).toBeLessThan(-185);
  expect((await pose(page)).quaternion).not.toEqual(start.quaternion);
  expect((await pose(page)).target).not.toEqual(start.target);
  await moveTo(page, 0);
  await expect.poll(() => pose(page)).toEqual(start);

  await stopAt(page, 'work-tiriz');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.locator('#work-tiriz').evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(1);
  await expect(canvas).toHaveAttribute('data-instance', 'original');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'qa/film-live-390.png' });
  expect(errors).toEqual([]);
});

test('the case and nested evidence return to the same scroll, camera and trigger', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./?debug-world=1');
  await page.getByRole('link', {name:'Explore selected work'}).click();
  await page.locator('#projects .shot-next').click();
  await expect(page.locator(readyCanvas)).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.cinematic')).toHaveAttribute('data-shot', 'work-tiriz');
  await expect.poll(() => page.locator('#work-tiriz').evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(1);
  const trigger = page.locator('#work-tiriz a[href="#tiriz"]');
  await trigger.focus();
  const beforeScroll = await page.evaluate(() => scrollY);
  const beforePose = await pose(page);
  await page.keyboard.press('Enter');
  const dossier = page.getByRole('dialog', { name: 'TIRIZ' });
  await expect(dossier).toBeVisible();
  await expect(dossier.locator('.project-gallery img')).toHaveCount(5);
  await expect.poll(() => pose(page)).not.toEqual(beforePose);
  const proof = dossier.getByRole('link', { name: 'Enlarge Payday Deals' });
  await proof.click();
  await expect(page.getByRole('dialog', { name: 'View proof' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(proof).toBeFocused();
  await page.screenshot({ path: 'qa/v6/project-tiriz.png' });
  await page.goBack();
  await expect(dossier).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(beforeScroll);
  await expect.poll(() => pose(page)).toEqual(beforePose);
  await page.mouse.wheel(0, 410);
  await expect.poll(() => pose(page)).not.toEqual(beforePose);
});

test('WebGL absence and system reduced motion preserve navigation and evidence', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, type: string, options: unknown) {
        return type.startsWith('webgl') ? null : Reflect.apply(original, this, [type, options]);
      },
    });
  });
  await page.goto('./');
  await expect(page.locator('#profile .shot-frame')).toHaveCSS('background-image', /arrival.*webp/);
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('link', { name: 'Explore selected work' }).click();
  await expect(page).toHaveURL(/#projects$/);
  await page.locator('#work-tiriz a[href="#tiriz"]').click();
  await expect(page).toHaveURL(/#tiriz$/);
  await expect(page.getByRole('dialog', { name: 'TIRIZ' })).toBeVisible();
  await page.getByRole('link', { name: 'Enlarge Happy Hour' }).press('Enter');
  await expect(page.getByRole('dialog', {name:'View proof'})).toBeVisible();
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Motion off' })).toHaveAttribute('aria-disabled', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('context loss restores the architectural posters and reading index', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');
  const canvas = page.locator(readyCanvas);
  await expect(canvas).toBeVisible({ timeout: 30_000 });
  const extension = await canvas.evaluate(element => {
    const lose = (element as HTMLCanvasElement).getContext('webgl2')?.getExtension('WEBGL_lose_context');
    lose?.loseContext();
    return Boolean(lose);
  });
  expect(extension).toBe(true);
  await expect(canvas).toHaveCount(0);
  await expect(page.locator('#profile .shot-frame')).toHaveCSS('background-image', /arrival.*webp/);
  await expect(page.getByRole('region', { name: 'Portfolio archive' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Explore' }).click();
  await page.getByRole('link', { name: /Open reading index/ }).click();
  await expect(page.getByRole('region', { name: 'Portfolio archive' })).toBeVisible();
});

test('prerendered chapters, published work and downloads are readable without scripts', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto('./');
    await expect(page.getByRole('heading', { name: /Muhammad Raihan\s*Ramadhan/ })).toBeVisible();
    await page.getByRole('link', { name: 'Explore selected work' }).click();
    await expect(page).toHaveURL(/#projects$/);
    await page.locator('#projects a[href="#divia"]').click();
    await expect(page.locator('#divia')).toContainText('104 clicks from 160 impressions');
    await expect(page.getByRole('link', { name: 'Portfolio PDF' })).toHaveAttribute('href', /Raihan_Signals_in_Motion_Portfolio\.pdf$/);
  } finally {
    await context.close();
  }
});

async function moveToPhase(page: Page, phase: number) {
  await page.evaluate(({phase, ids}) => {
    const start = Math.floor(phase);
    const fraction = phase - start;
    const from = document.getElementById(ids[start])!.getBoundingClientRect().top + scrollY;
    const to = document.getElementById(ids[start + 1])!.getBoundingClientRect().top + scrollY;
    scrollTo({top:from + (to - from) * fraction, behavior:'instant'});
  }, { phase, ids: stopIds });
}

test('the three Flow clips load on demand and scrub in both directions', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (request.url().endsWith('.webm')) requests.push(request.url()); });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');
  await expect(page.locator(readyCanvas)).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.flow-insert video[src]')).toHaveCount(0);
  expect(requests).toEqual([]);

  for (const { name, forward, back } of [
    { name: 'arrival', forward: .39, back: .21 },
    { name: 'transformation', forward: 5.22, back: 4.85 },
    { name: 'departure', forward: 6.9, back: 6.74 },
  ]) {
    const player = page.locator('.flow-insert video[data-clip="' + name + '"]');
    await moveToPhase(page, forward);
    await expect(player).toHaveAttribute('src', new RegExp('/' + name + '[-.].*webm$'));
    const readTime = () => player.evaluate(video => (video as HTMLVideoElement).currentTime);
    await expect.poll(readTime).toBeGreaterThan(5);
    await expect.poll(() => player.evaluate(video => (video as HTMLVideoElement).videoWidth)).toBe(1280);
    expect(await player.evaluate(video => (video as HTMLVideoElement).paused)).toBe(true);
    const held = await readTime();
    await page.waitForTimeout(250);
    expect(await readTime()).toBe(held);
    await moveToPhase(page, back);
    await expect.poll(readTime).toBeLessThan(held - 1);
    await expect.poll(() => player.evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.1);
    await player.evaluate(el => { el.dataset.retained = 'true'; });
    await moveToPhase(page, 3.5);
    await moveToPhase(page, back);
    await expect(player).toHaveAttribute('data-retained','true');
    await page.screenshot({ path: 'qa/v5/flow-integrated-' + name + '.png' });
  }

  expect(requests.some(url => url.includes('arrival-'))).toBe(true);
  expect(requests.some(url => url.includes('transformation-'))).toBe(true);
  expect(requests.some(url => url.includes('departure-'))).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.flow-insert video')).toHaveCount(0);
  await expect(page.locator(readyCanvas)).toHaveCount(0);
});
test('leadership, capabilities and results reveal content at their scene', async ({page}) => {
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('./?debug-world=1#experience');
  const canvas = page.locator(readyCanvas);
  await expect(canvas).toBeVisible({timeout:30_000});
  await canvas.evaluate(el => { el.dataset.journey = 'same'; });
  const y = await page.evaluate(() => scrollY);
  const before = await pose(page);
  const trigger = page.locator('#experience a[href="#hima"]');
  await trigger.click();
  const experience = page.getByRole('dialog',{name:/HIMA Mankom/});
  await expect(experience).toContainText('81 registrations out of 92 new members');
  await expect(experience.getByText('03 / What I did')).toBeVisible();
  await expect(experience.locator('.experience-photo img')).toBeVisible();
  await expect(experience).toHaveAttribute('data-phase','reading');
  await page.screenshot({path:'qa/v6/leadership-detail.png',animations:'disabled'});
  await page.keyboard.press('Escape');
  await expect(experience).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(y);
  await expect.poll(() => pose(page)).toEqual(before);
  await expect(canvas).toHaveAttribute('data-journey','same');

  for (const [id, label] of [['about','Capabilities in practice'],['impact','Results and sources']]) {
    await stopAt(page,id);
    const origin = await page.evaluate(() => scrollY);
    await page.getByRole('link',{name:label}).click();
    await expect(page.getByRole('dialog',{name:label})).toBeVisible();
    await expect(page.locator('.reading-archive')).toHaveCount(0);
    await page.getByRole('button',{name:'Close panel'}).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await page.evaluate(() => scrollY)).toBe(origin);
  }
});

test('a touch visitor can open a gallery while WebGL is loading and return in place', async ({browser,baseURL}) => {
  const context = await browser.newContext({baseURL,viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'no-preference'});
  try {
    const page = await context.newPage();
    let release!: () => void;
    const hold = new Promise<void>(resolve => { release = resolve; });
    await page.route(/\/Scene-[^/]+\.js$/, async route => { await hold; await route.continue(); });
    await page.goto('./#projects');
    await expect(page.locator('.cinematic')).toHaveAttribute('data-interactive','true');
    const stops = () => page.locator('[data-world-track]').evaluate(el => [...el.children].map(shot => (shot as HTMLElement).offsetTop));
    const initial = await stops();
    const y = await page.evaluate(() => scrollY);
    await page.locator('#projects a[href="#divia"]').tap();
    const gallery = page.getByRole('dialog',{name:'Divia Unpad TV'});
    await expect(gallery).toBeVisible();
    await expect(gallery.locator('.project-gallery img')).toHaveCount(4);
    await expect(page.locator('canvas')).toHaveCount(0);
    release();
    await expect(page.locator(readyCanvas)).toBeVisible({timeout:30_000});
    expect(await stops()).toEqual(initial);
    const sample = gallery.getByRole('link',{name:/Enlarge Cara Mudah/});
    await sample.tap();
    await expect(page.getByRole('dialog',{name:'View proof'}).locator('img')).toBeVisible();
    await page.getByRole('button',{name:'Close proof'}).tap();
    await page.screenshot({path:'qa/v6/mobile-project.png'});
    await page.getByRole('button',{name:'Close case study'}).tap();
    await expect(gallery).toHaveCount(0);
    expect(await page.evaluate(() => scrollY)).toBe(y);
    await expect(page.locator('.cinematic')).toHaveAttribute('data-shot','projects');
  } finally { await context.close(); }
});
