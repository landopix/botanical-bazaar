import asyncio
import os
import sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 720},
            record_video_dir="/home/jules/verification/videos"
        )
        page = await context.new_page()

        # Open shop page
        print("Navigating to shop page...")
        await page.goto("http://localhost:3000/shop", wait_until="networkidle")

        # Take shop page screenshot
        await page.screenshot(path="/home/jules/verification/screenshots/shop_images.png")
        print("Shop page screenshot saved.")

        # Click on 'Peanut Butter Fruit' card
        print("Clicking on Peanut Butter Fruit plant detail link...")
        await page.click("text=Bunchosia Glandulifera 'Peanut Butter Fruit'")
        await page.wait_for_timeout(2000) # Wait for page data to load

        # Take product detail screenshot
        await page.screenshot(path="/home/jules/verification/screenshots/product_detail_image.png")
        print("Product detail screenshot saved.")

        await context.close()
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
