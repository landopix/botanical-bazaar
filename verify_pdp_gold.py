import asyncio
from playwright.async_api import async_playwright
import subprocess
import time
import os

async def main():
    print("Starting Next.js server...")
    server = subprocess.Popen(["npm", "run", "start"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(4)

    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 900})

        print("Navigating to product page...")
        await page.goto("http://localhost:3000/product/test-monstera", wait_until="networkidle")
        await page.screenshot(path="/home/jules/verification/screenshots/product_detail_gold_card.png")
        print("Captured PDP screenshot with gold card.")

        await browser.close()

    server.terminate()
    print("Verification complete.")

if __name__ == "__main__":
    asyncio.run(main())
