import { expect, test, type Page } from '@playwright/test';

async function renderedFrame(page: Page) {
  return page.locator('.film-live canvas').evaluate(canvas => {
    const frame = (canvas as HTMLCanvasElement).toDataURL();
    let hash = 0;
    for (let index = 0; index < frame.length; index++) hash = Math.imul(31, hash) + frame.charCodeAt(index) | 0;
    return hash;
  });
}

async function moveTo(page: Page, top: number) {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), top);
}

test('one live WebGL canvas scrubs, pauses and reverses across six chapters', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, type: string, options: Record<string, unknown>) {
        return Reflect.apply(original, this, [type, type === 'webgl2' ? { ...options, preserveDrawingBuffer: true } : options]);
      },
    });
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('./');
  await expect(page.locator('.film-live[data-ready=true] canvas')).toBeVisible({ timeout: 30_000 });
  const canvas = page.locator('.film-live canvas');
  await canvas.evaluate(el => { el.dataset.instance = 'original'; });
  await expect(page.locator('.signal-still')).toHaveCSS('opacity', '0');
  const start = await renderedFrame(page);
  await page.screenshot({ path: 'qa/film-live-opening.png' });
  const aboutTop = await page.locator('#about').evaluate(element => element.getBoundingClientRect().top + scrollY);
  for (const fraction of [0.12, 0.24, 0.38, 0.53]) await moveTo(page, aboutTop * fraction);
  await expect.poll(() => renderedFrame(page)).not.toBe(start);
  const paused = await renderedFrame(page);
  await page.waitForTimeout(350);
  expect(await renderedFrame(page)).toBe(paused);
  for (const id of ['about', 'projects', 'experience', 'impact', 'contact']) {
    await page.locator('#' + id).evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
    await page.screenshot({ path: 'qa/film-live-' + id + '.png' });
    await expect(canvas).toHaveAttribute('data-instance', 'original');
  }
  await moveTo(page, 0);
  await expect.poll(() => renderedFrame(page)).toBe(start);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(canvas).toHaveAttribute('data-instance', 'original');
  await expect.poll(() => renderedFrame(page)).not.toBe(start);
  await page.screenshot({ path: 'qa/film-live-390.png' });
  expect(errors).toEqual([]);
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
  await expect(page.locator('.signal-still')).toHaveCSS('opacity', '1');
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('link', { name: 'Explore selected work' }).click();
  await expect(page).toHaveURL(/#projects$/);
  await page.locator('.gallery-index').getByRole('link', { name: /TIRIZ/ }).click();
  await expect(page).toHaveURL(/#tiriz$/);
  await page.locator('#tiriz').getByRole('button', { name: 'View project proof' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Motion off' })).toHaveAttribute('aria-disabled', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('context loss replaces the scene with the static illustration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');
  const canvas = page.locator('.film-live[data-ready=true] canvas');
  await expect(canvas).toBeVisible({ timeout: 30_000 });
  const extension = await canvas.evaluate(element => {
    const lose = (element as HTMLCanvasElement).getContext('webgl2')?.getExtension('WEBGL_lose_context');
    lose?.loseContext();
    return Boolean(lose);
  });
  expect(extension).toBe(true);
  await expect(canvas).toHaveCount(0);
  await expect(page.locator('.signal-still')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('link', { name: 'Explore selected work' })).toBeVisible();
});

test('prerendered chapters, published work and downloads are readable with scripts disabled', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto('./');
    await expect(page.getByRole('heading', { name: 'Muhammad Raihan Ramadhan' })).toBeVisible();
    await page.getByRole('link', { name: 'Explore selected work' }).click();
    await expect(page).toHaveURL(/#projects$/);
    await page.locator('.gallery-index').getByRole('link', { name: /Divia Unpad TV/ }).click();
    await expect(page.locator('#divia')).toContainText('104 clicks from 160 impressions');
    await expect(page.getByRole('link', { name: 'Portfolio PDF' })).toHaveAttribute('href', /Raihan_Signals_in_Motion_Portfolio\.pdf$/);
  } finally {
    await context.close();
  }
});
