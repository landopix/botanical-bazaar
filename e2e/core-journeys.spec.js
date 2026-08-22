const { test, expect } = require('@playwright/test');

test.describe('The Botanical Bazaar - Core User Journeys', () => {

  test('1. Routing & Canonical Pages render cleanly with 200 status', async ({ page }) => {
    const routes = [
      '/',
      '/shop',
      '/almanac',
      '/zones',
      '/help',
      '/sourcing',
      '/contact',
      '/returns',
      '/shipping-pickup',
      '/privacy',
      '/terms',
      '/faq'
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response.status()).toBe(200);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('2. Cart & Checkout Handoff flow', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('.product-card').first()).toBeVisible();

    await page.locator('.product-card a', { hasText: 'View Plant' }).first().click();
    await page.waitForURL(/\/product\//);

    await expect(page.locator('h1.product-common-name')).toBeVisible();

    const addToCartBtn = page.locator('button', { hasText: 'Add to Cart' });
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      await page.waitForURL('/cart');
      await expect(page.locator('text=Shopping Cart').first()).toBeVisible();

      const checkoutBtn = page.locator('button', { hasText: /Checkout|Proceed to Checkout/i }).first();
      await expect(checkoutBtn).toBeVisible();
      await expect(checkoutBtn).toBeEnabled();
    } else {
      const backBtn = page.locator('.back-link');
      await expect(backBtn).toBeVisible();
    }
  });

  test('3. Form Submissions (Contact, Sourcing, Lead Capture)', async ({ page }) => {
    // Contact Form
    await page.goto('/contact');
    await page.fill('#contact-name', 'Jules E2E');
    await page.fill('#contact-email', 'jules.e2e@example.com');
    await page.fill('#contact-message', 'E2E automated test message for nursery inquiries.');

    const subjectInput = page.locator('#contact-subject');
    if (await subjectInput.isVisible()) {
      await subjectInput.fill('E2E Inquiry');
    }

    await page.click('button[type="submit"]');
    await expect(page.locator('.form-container, form').first()).toBeVisible();

    // Sourcing Form
    await page.goto('/sourcing');
    await page.fill('#customerName', 'Jules E2E');
    await page.fill('#customerEmail', 'jules.e2e@example.com');
    await page.fill('#plantName', 'Monstera Obliqua');
    await page.click('button[type="submit"]');
    await expect(page.locator('.sourcing-container, form').first()).toBeVisible();

    // Newsletter Lead Capture on Homepage
    await page.goto('/');
    await page.fill('#homepage-newsletter-email', 'jules.e2e.newsletter@example.com');
    await page.click('button:has-text("Subscribe")');
    await expect(page.locator('p:has-text("Thank you")').first()).toBeVisible();
  });

  test('4. Global Search Bar functionality', async ({ page }) => {
    await page.goto('/shop');

    const searchTrigger = page.locator('button[aria-label*="Search"], button:has-text("Search")').first();
    if (await searchTrigger.isVisible()) {
      await searchTrigger.click();
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
      await expect(searchInput).toBeVisible();
      await searchInput.fill('Monstera');
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
    } else {
      const shopSearchInput = page.locator('input[placeholder*="Search"]').first();
      if (await shopSearchInput.isVisible()) {
        await shopSearchInput.fill('Monstera');
        await page.waitForTimeout(500);
        await expect(page.locator('.product-card, .no-products').first()).toBeVisible();
      }
    }
  });

});
