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

  await page.setViewportSize({ width: 390, height: 844 });
  await stopAt(page, 'work-tiriz');
  await expect(canvas).toHaveAttribute('data-instance', 'original');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'qa/film-live-390.png' });
  expect(errors).toEqual([]);
});

test('the case and nested evidence return to the same scroll, camera and trigger', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./?debug-world=1#work-tiriz');
  await expect(page.locator(readyCanvas)).toBeVisible({ timeout: 30_000 });
  await stopAt(page, 'work-tiriz');
  const trigger = page.locator('#work-tiriz a[href="#tiriz"]');
  await trigger.focus();
  const beforeScroll = await page.evaluate(() => scrollY);
  const beforePose = await pose(page);
  await page.keyboard.press('Enter');
  const dossier = page.getByRole('dialog', { name: 'TIRIZ' });
  await expect(dossier).toBeVisible();
  const proof = dossier.getByRole('button', { name: 'View project proof' });
  await proof.click();
  await expect(page.getByRole('dialog', { name: 'View proof' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(proof).toBeFocused();
  await page.screenshot({ path: 'qa/v5-case-dialog.png' });
  await page.keyboard.press('Escape');
  await expect(dossier).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(beforeScroll);
  await expect.poll(() => pose(page)).toEqual(beforePose);
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
  await page.locator('#tiriz').getByRole('button', { name: 'View project proof' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
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
