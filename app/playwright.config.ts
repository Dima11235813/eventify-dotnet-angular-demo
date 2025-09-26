import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm start',
		port: 4200,
		reuseExistingServer: true,
		timeout: 120_000
	},
	testDir: './tests/e2e',
	use: {
		baseURL: 'http://localhost:4200',
		headless: true,
		screenshot: 'only-on-failure',
		video: 'retain-on-failure'
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }
	]
});


