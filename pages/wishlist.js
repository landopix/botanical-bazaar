import React from "react";
import Link from "next/link";
import Button from "../components/Button";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ color: "#D4B06A", marginBottom: "1.5rem", fontFamily: "'Cinzel', serif", textTransform: "uppercase", letterSpacing: "0.15em" }}>
          Your Wishlist is Empty
        </h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem", color: "#E9DCBE" }}>
          Save your favorite rare and resilient tropical plants to view or buy
          later!
        </p>
        <Button variant="gold-filled" href="/shop">
          Browse the Catalog
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{ padding: "3rem 1.5rem", maxWidth: "1050px", margin: "0 auto", boxSizing: "border-box" }}
    >
      <h1
        style={{
          color: "#D4B06A",
          textAlign: "center",
          marginBottom: "2.5rem",
          fontFamily: "'Cinzel', serif",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          fontSize: "2.5rem"
        }}
      >
        Your Botanical Wishlist
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1.5rem",
          alignItems: "stretch"
        }}
      >
        {wishlist.map((product) => {
          const isSoldOut = !product.quantity || product.quantity < 3;
          const imageSrc = product.image ? (product.image.startsWith("http") || product.image.startsWith("/") ? product.image : "/" + product.image) : "/assets/placeholder.png";

          return (
            <div
              key={product.slug}
              className={`product-card ${isSoldOut ? "sold-out" : ""}`}
              style={{
                backgroundColor: "#F5E7C4",
                border: "1px solid #D4B06A",
                borderRadius: "10px",
                padding: "1.2rem",
                color: "#00301E",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
                position: "relative",
                boxSizing: "border-box"
              }}
            >
              <button
                onClick={() => removeFromWishlist(product.slug)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "#ba2f2f",
                  border: "none",
                  borderRadius: "50%",
                  width: "26px",
                  height: "26px",
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  zIndex: 10,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                }}
                title="Remove from Wishlist"
                aria-label="Remove from wishlist"
              >
                ✕
              </button>

              <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, textAlign: "center" }}>
                <Link
                  href={`/product/${product.slug}`}
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <div
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      width: "100%",
                      aspectRatio: "4 / 3",
                      marginBottom: "0.8rem",
                      borderRadius: "8px",
                      background: "rgba(0, 0, 0, 0.05)"
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = "/assets/placeholder.png";
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block"
                      }}
                    />
                  </div>
                  <strong
                    style={{
                      display: "block",
                      marginTop: "0.4rem",
                      fontSize: "1.2rem",
                      fontFamily: "'Cinzel', serif",
                      lineHeight: "1.2",
                      minHeight: "3.2rem",
                      color: "#00301E"
                    }}
                  >
                    {product.name}
                  </strong>
                </Link>
                <p style={{ margin: "0.2rem 0", fontSize: "1rem", color: "#555", fontFamily: "'Crimson Text', serif" }}>
                  {product.sizes || "Standard Pot"}
                </p>
                <p style={{ margin: "0.1rem 0", fontSize: "1rem", color: "#00301E", fontFamily: "'Crimson Text', serif" }}>
                  {product.type}
                </p>
                <p style={{ fontWeight: "bold", margin: "0.4rem 0 0.2rem 0", fontSize: "1.1rem", color: isSoldOut ? "#ba2f2f" : "#11402A", fontFamily: "'Crimson Text', serif" }}>
                  {isSoldOut
                    ? "Sold Out"
                    : isNaN(product.price) || !product.price
                      ? "Price on Request"
                      : `$${product.price.toFixed(2)}`}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  marginTop: "0.8rem",
                  width: "100%"
                }}
              >
                {!isSoldOut ? (
                  <Button
                    variant="green-filled"
                    onClick={() => addToCart(product, 1)}
                    style={{ width: "100%", fontFamily: "'Crimson Text', serif", fontSize: "1rem", padding: "0.5rem 1.2rem", borderRadius: "18px" }}
                  >
                    Add to Cart
                  </Button>
                ) : (
                  <div
                    style={{
                      background: "#ba2f2f",
                      color: "#ffffff",
                      padding: "0.5rem",
                      borderRadius: "18px",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      fontFamily: "'Crimson Text', serif"
                    }}
                  >
                    Sold Out
                  </div>
                )}
                <Button
                  variant="outline"
                  href={`/product/${product.slug}`}
                  style={{ width: "100%", fontFamily: "'Crimson Text', serif", fontSize: "0.95rem", padding: "0.4rem 1rem", borderRadius: "18px" }}
                >
                  View Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
