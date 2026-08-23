# Shopify Primary Domain & Brand Return URL Configuration Guide (BB-02)

This document provides step-by-step instructions for configuring **The Botanical Bazaar** Shopify Admin settings to ensure brand consistency, correct checkout return URLs, primary domain settings, and theme-level redirects.

---

## 1. Set Primary Domain in Shopify Admin

1. Log in to your **Shopify Admin** dashboard (`https://admin.shopify.com/store/the-botanical-bazaar`).
2. Go to **Settings** (gear icon in the bottom left) > **Domains**.
3. If `thebotanicalbazaar.com` is not listed, click **Connect existing domain** and follow the prompts to verify your custom domain.
4. Click on `thebotanicalbazaar.com`.
5. Click **Change domain type** and set it as the **Primary domain**.
6. Ensure **Domain redirection** is enabled so that traffic to subdomains or secondary domains redirects to `https://thebotanicalbazaar.com/`.

---

## 2. Configure Storefront Return URL & Brand Links in Checkout

1. In Shopify Admin, go to **Settings** > **Checkout**.
2. Scroll to the **Checkout customization** or **Storefront branding** section.
3. Click **Customize** on your active checkout theme/configuration.
4. In the theme editor header / settings:
   - Ensure the logo links back to `https://thebotanicalbazaar.com/`.
   - Set the Storefront return URL to `https://thebotanicalbazaar.com/`.
5. Save changes and publish.

---

## 3. Shopify Theme Liquid Redirect Script (Prevent Raw `.myshopify.com` Duplication)

To prevent any residual traffic or search indexing on `the-botanical-bazaar.myshopify.com` from displaying a duplicated public experience, add the following JavaScript redirect snippet into your active Shopify Theme layout file (`layout/theme.liquid`) inside the `<head>` section:

```html
{% comment %}
  Redirect raw .myshopify.com visits directly to the custom storefront domain
{% endcomment %}
<script>
  (function() {
    var primaryDomain = 'thebotanicalbazaar.com';
    var currentHost = window.location.hostname;

    // Check if the buyer is visiting via .myshopify.com (and not in administrative preview or checkout)
    if (currentHost.indexOf('myshopify.com') !== -1 && !window.location.pathname.startsWith('/checkout') && !window.location.pathname.startsWith('/admin')) {
      var targetUrl = 'https://' + primaryDomain + window.location.pathname + window.location.search + window.location.hash;
      window.location.replace(targetUrl);
    }
  })();
</script>
```

### Steps to Install in Shopify Theme:
1. In Shopify Admin, go to **Online Store** > **Themes**.
2. Click **...** (Actions) next to your active theme > **Edit code**.
3. Open `layout/theme.liquid`.
4. Paste the snippet right after the opening `<head>` tag.
5. Click **Save**.

---

## 4. Verification

- Visit `https://the-botanical-bazaar.myshopify.com/` in an incognito window. It should immediately redirect to `https://thebotanicalbazaar.com/`.
- Initiate a test cart/checkout sequence from the custom site. In the checkout flow, clicking the brand logo or "Return to store" link should return the buyer to `https://thebotanicalbazaar.com/`.
