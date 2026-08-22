import asyncio
from playwright.async_api import async_playwright
import subprocess
import time
import os
import sys

async def main():
    print("Starting Next.js production server for testing...")
    server = subprocess.Popen(["npm", "run", "start"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(5)

    os.makedirs("/tmp/verification/screenshots", exist_ok=True)
    success = True

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page(viewport={"width": 1280, "height": 900})

            # Setup initial cart in localStorage
            await page.goto("http://localhost:3000/", wait_until="networkidle")
            await page.evaluate('''() => {
                const sampleCart = [{
                    slug: 'smooth-agave-agave-demeesteriana',
                    name: 'Smooth Agave',
                    price: 45.00,
                    quantity: 1,
                    selectedSize: '5 Gallon Container',
                    variantId: 'gid://shopify/ProductVariant/12345'
                }];
                localStorage.setItem('botanical_cart', JSON.stringify(sampleCart));
            }''')

            # -------------------------------------------------------------
            # Test 1: Full Cart Page (/cart) - Checkout Button bfcache reset
            # -------------------------------------------------------------
            print("\n--- Test 1: Checking /cart page bfcache reset ---")
            await page.goto("http://localhost:3000/cart", wait_until="networkidle")

            checkout_btn = page.locator("button:has-text('Proceed to Checkout')")
            await checkout_btn.wait_for(state="visible")
            print("Checkout button is visible and active.")

            # Route /api/checkout to delay response so we can inspect loading state
            async def delayed_checkout(route):
                await asyncio.sleep(2)
                await route.fulfill(status=200, json={"url": "https://checkout.shopify.com/fake"})

            await page.route("**/api/checkout", delayed_checkout)

            # Click Checkout
            await checkout_btn.click()

            # Verify loading state is active
            loading_btn = page.locator("button:has-text('Redirecting to secure checkout...')")
            await loading_btn.wait_for(state="visible", timeout=3000)
            is_disabled = await loading_btn.is_disabled()
            print(f"Loading state detected! Button disabled state: {is_disabled}")
            if not is_disabled:
                print("ERROR: Checkout button should be disabled during redirect.")
                success = False

            await page.screenshot(path="/tmp/verification/screenshots/1_cart_loading.png")

            # Simulate browser back navigation page restoration (pageshow event)
            print("Dispatching 'pageshow' event to simulate returning from bfcache/back navigation...")
            await page.evaluate("window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))")

            # Verify button resets to original state
            await checkout_btn.wait_for(state="visible", timeout=3000)
            is_disabled_after = await checkout_btn.is_disabled()
            print(f"After pageshow event: Button reset verified! Button disabled state: {is_disabled_after}")
            if is_disabled_after:
                print("ERROR: Checkout button remained disabled after pageshow event!")
                success = False

            await page.screenshot(path="/tmp/verification/screenshots/2_cart_reset.png")

            # -------------------------------------------------------------
            # Test 2: Almanac Page (/almanac) - Form submitting bfcache reset
            # -------------------------------------------------------------
            print("\n--- Test 2: Checking /almanac subscription form bfcache reset ---")
            await page.goto("http://localhost:3000/almanac", wait_until="networkidle")

            # Route /api/inquiry/send to delay response
            async def delayed_inquiry(route):
                await asyncio.sleep(2)
                await route.fulfill(status=200, json={"success": True})

            await page.route("**/api/inquiry/send", delayed_inquiry)

            email_input = page.locator("input[type='email']").first
            await email_input.fill("testsubscriber@example.com")

            almanac_sub_btn = page.locator("button:has-text('Join The Almanac Registry')")
            await almanac_sub_btn.click()

            # Verify submitting state
            submitting_btn = page.locator("button:has-text('Submitting...')")
            await submitting_btn.wait_for(state="visible", timeout=3000)
            print("Form submitting state detected!")

            # Dispatch pageshow
            print("Dispatching 'pageshow' event...")
            await page.evaluate("window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))")

            # Verify button resets
            await almanac_sub_btn.wait_for(state="visible", timeout=3000)
            print("Almanac form submit button reset verified!")

            await browser.close()

    finally:
        server.terminate()

    if success:
        print("\n✅ ALL BFCACHE RESET TESTS PASSED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("\n❌ BFCACHE RESET TESTS FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
