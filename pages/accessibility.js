import SEO from "../components/SEO";
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Accessibility() {
  return (
    <>
      <SEO title="Accessibility Statement" description="Accessibility commitment and statement for The Botanical Bazaar storefront." />
      <div className="min-h-screen bg-[#00301E] text-[#F5E7C4] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-[#1C3D2E] border border-[#D4B06A] rounded-lg p-6 sm:p-10 shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-serif text-[#D4B06A] tracking-wider text-center uppercase mb-8 border-b border-[#D4B06A]/30 pb-4">
            ACCESSIBILITY STATEMENT
          </h1>

          <div className="space-y-6 font-sans leading-relaxed text-base sm:text-lg">
            <section>
              <h2 className="text-xl sm:text-2xl font-serif text-[#D4B06A] mb-3">
                Our Commitment to Web Accessibility
              </h2>
              <p className="text-[#F5E7C4]/90">
                <strong>The Botanical Bazaar LLC</strong> is dedicated to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, applying relevant accessibility standards, and adhering to the Web Content Accessibility Guidelines (<strong>WCAG 2.1 Level AA</strong>) principles: <em>Perceivable, Operable, Understandable, and Robust</em>.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-serif text-[#D4B06A] mb-3">
                Entity Details &amp; Website Scope
              </h2>
              <ul className="list-disc list-inside space-y-2 text-[#F5E7C4]/90">
                <li><strong>Entity Name:</strong> The Botanical Bazaar LLC</li>
                <li><strong>Official Website:</strong> <a href="https://thebotanicalbazaar.com" className="text-[#D4B06A] underline hover:text-[#E9DCBE]">https://thebotanicalbazaar.com</a></li>
                <li><strong>Location:</strong> St. Petersburg, Florida, USA</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-serif text-[#D4B06A] mb-3">
                Accessibility Accommodations &amp; Alternative Formats
              </h2>
              <p className="text-[#F5E7C4]/90">
                We strive to ensure that all visitors can seamlessly browse our rare tropical plant catalog, request plant sourcing, review cold hardiness guidance, and complete transactions. If you experience difficulty accessing any content on our site or require assistance in an alternative format (such as large print or screen-reader assistance), please contact our team.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-serif text-[#D4B06A] mb-3">
                Feedback &amp; Contact Information
              </h2>
              <p className="text-[#F5E7C4]/90">
                We welcome your feedback on the accessibility of The Botanical Bazaar. Please let us know if you encounter accessibility barriers on our site:
              </p>
              <div className="bg-[#00301E] border border-[#D4B06A]/50 rounded p-4 mt-3">
                <p className="text-[#F5E7C4] font-medium">
                  <strong>Contact Email:</strong>{' '}
                  <a href="mailto:info@thebotanicalbazaar.com?subject=Accessibility%20Issue" className="text-[#D4B06A] underline hover:text-[#E9DCBE]">
                    info@thebotanicalbazaar.com
                  </a>
                </p>
                <p className="text-[#F5E7C4]/80 text-sm mt-1">
                  <em>Please use the subject line: &quot;Accessibility Issue&quot;</em>
                </p>
                <p className="text-[#F5E7C4]/90 text-sm mt-2">
                  <strong>Response SLA:</strong> We commit to acknowledging all accessibility inquiries and feedback within <strong>2 business days</strong>.
                </p>
              </div>
            </section>

            <div className="pt-6 border-t border-[#D4B06A]/30 flex justify-center">
              <Link
                href="/shop"
                className="inline-block bg-[#00301E] text-[#D4B06A] border border-[#D4B06A] hover:bg-[#D4B06A] hover:text-[#00301E] font-serif px-6 py-3 rounded text-center transition-colors font-medium tracking-wide"
              >
                RETURN TO SHOP
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
