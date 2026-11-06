import { defineConfig, devices } from '@playwright/test';

const base = process.env.VITE_BASE_PATH || '/raihan-cinematic-portfolio/';
const local = 'http://127.0.0.1:4174' + base;
const published = process.env.PORTFOLIO_TEST_URL;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'qa/playwright-results.json' }]],
  use: {
    baseURL: published || local,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    reducedMotion: 'reduce',
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    launchOptions: { args: ['--enable-webgl', '--enable-unsafe-swiftshader'] },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: published ? undefined : {
    command: 'npm run preview',
    url: local,
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  },
});
