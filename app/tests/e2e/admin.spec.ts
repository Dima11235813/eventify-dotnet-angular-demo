import { test, expect } from '@playwright/test';

// Helper to ensure API is running per repo rules
async function ensureApi(page: any) {
	// Try a quick fetch to API swagger; if unreachable, warn via test.skip
	try {
		const resp = await page.request.get('http://localhost:5146/swagger');
		if (resp.status() >= 400) test.skip(true, 'API not healthy for e2e');
	} catch {
		test.skip(true, 'API not running. Start API via dotnet run as per repo rules.');
	}
}

test.describe('Admin UI', () => {
	test.beforeEach(async ({ page }) => {
		await ensureApi(page);
		await page.goto('/admin');
	});

	test('dashboard layout matches basic selectors', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
		await expect(page.getByText('Overview of your event management system')).toBeVisible();
		await expect(page.locator('.kpi-grid [data-testid="kpi-card"]')).toHaveCount(3);
		await expect(page.getByText('Recent Events')).toBeVisible();
	});

	test('dashboard KPI cards are aligned horizontally', async ({ page }) => {
		const cards = page.locator('.kpi-grid [data-testid="kpi-card"]');
		await expect(cards).toHaveCount(3);
		const boxes = await cards.evaluateAll((els) => els.map(el => el.getBoundingClientRect().top));
		// All tops should be nearly equal (same row)
		const minTop = Math.min(...boxes);
		const maxTop = Math.max(...boxes);
		expect(maxTop - minTop).toBeLessThan(5);
	});

	test('recent event list right column is right-aligned', async ({ page }) => {
		const right = page.locator('[data-testid="recent-right"]').first();
		await expect(right).toBeVisible();
		const textAlign = await right.evaluate(el => getComputedStyle(el.querySelector('.recent-registered') as HTMLElement).textAlign);
		expect(textAlign).toBe('right');
	});

	test('sidebar width and main padding', async ({ page }) => {
		const sidebar = page.locator('aside.admin-sidebar');
		const main = page.locator('main.admin-main');
		const sidebarWidth = await sidebar.evaluate(el => Math.round(getComputedStyle(el).width.replace('px','') as unknown as number) || Math.round((el as HTMLElement).getBoundingClientRect().width));
		const mainPadding = await main.evaluate(el => getComputedStyle(el).paddingLeft);
		expect(sidebarWidth).toBeGreaterThanOrEqual(258); // approx 260
		expect(mainPadding).toBe('48px');
	});

	test('kpi stack on small screens', async ({ page, browserName }) => {
		await page.setViewportSize({ width: 600, height: 900 });
		const cols = await page.locator('.kpi-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns);
		expect(cols.split(' ').length).toBe(1);
	});

	test('navigate to Manage Events and see table', async ({ page }) => {
		await page.getByRole('link', { name: 'Manage Events' }).click();
		await expect(page.getByRole('heading', { name: 'Manage Events' })).toBeVisible();
		await expect(page.locator('table.admin-table tbody tr')).toHaveCountGreaterThan(0);
	});

	test('navigate to Create Event and validate form', async ({ page }) => {
		await page.getByRole('link', { name: 'Create Event' }).click();
		await expect(page.getByRole('heading', { name: 'Create Event' })).toBeVisible();
		await page.getByLabel('Event Title *').fill('E2E Test Event');
		await page.getByLabel('Date *').fill('2099-12-31');
		await page.getByLabel('Max Capacity *').fill('50');
		await page.getByRole('button', { name: 'Create Event' }).isEnabled();
	});
});


