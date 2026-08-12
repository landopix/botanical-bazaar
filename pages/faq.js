import React from "react";
import Button from "../components/Button";

export default function FAQ() {
  const faqs = [
    {
      q: "Where are you located?",
      a: "We are situated in beautiful St. Petersburg, Florida. Our nursery address and pickup coordination instructions are sent once your order checkout completes successfully.",
    },
    {
      q: "Do you ship live plants?",
      a: "No. At this time we focus strictly on local pick up in St. Petersburg to ensure the absolute health, hydration, and highest visual quality of your delicate rare specimens.",
    },
    {
      q: "What is your seasonal shipping & transit protection policy?",
      a: "To protect delicate botanical specimens during transit: during cold winter transit we recommend heat packs and insulated thermal wrap wraps to protect sensitive tropical foliage from drafts. During extreme summer heat, we emphasize shaded, well-ventilated travel and prompt pickup coordination to prevent thermal damage.",
    },
    {
      q: "What hardiness zone are you located in, and how do I find mine?",
      a: "The Botanical Bazaar is locally situated in USDA climate Zone 10a (St. Petersburg, FL), offering the perfect year-round environment for tropical flora. For customers visiting from colder regions, we provide a complete hardiness zone guide with tailored plant care tips to help you transition collector specimens indoors when local temperatures drop.",
    },
    {
      q: "What is your live plant guarantee?",
      a: "We guarantee our plants are perfectly healthy, robust, and correctly identified at the time of pickup. Guides are happy to review care guidelines with you before you leave!",
    },
  ];

  return (
    <div
      style={{ padding: "3rem 1.5rem", maxWidth: "800px", margin: "0 auto" }}
    >
      <h1
        style={{
          color: "#D4B06A",
          textAlign: "center",
          fontFamily: "Cinzel, serif",
          marginBottom: "2.5rem",
        }}
      >
        Frequently Asked Questions
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {faqs.map((faq, i) => (
          <div
            key={i}
            style={{
              background: "#1C3D2E",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #D4B06A",
            }}
          >
            <h3
              style={{
                color: "#D4B06A",
                margin: "0 0 0.8rem 0",
                fontFamily: "Cinzel, serif",
              }}
            >
              🌱 {faq.q}
            </h3>
            <p style={{ margin: 0, lineHeight: "1.6" }}>{faq.a}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
          Still have specific horticultural or order queries?
        </p>
        <Button variant="gold-filled" href="/contact">
          Get in Touch
        </Button>
      </div>
    </div>
  );
}
