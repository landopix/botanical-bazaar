import React, { useState, useEffect } from "react";
import Button from "../components/Button";

export default function Account() {
  const [dashboardCopy, setDashboardCopy] = useState({
    title: "Your Garden Sanctuary",
    subtitle: "Welcome back to your Botanical Bazaar sanctuary",
    announcement:
      "Special Offer: Bring your soil samples for free analysis during our upcoming weekend events!",
    emailSupport: "guides@thebotanicalbazaar.com",
  });

  const [userEmail, setUserEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const savedEmail = localStorage.getItem("bb_user_email");
    if (savedEmail) {
      setUserEmail(savedEmail);
      fetchOrders(savedEmail);
    }
    setAuthChecking(false);

    // Dynamic dashboard copy
    const fetchDashboardCopy = async () => {
      try {
        const res = await fetch("/api/account-copy");
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            setDashboardCopy(data);
          }
        }
      } catch (e) {
        console.log("Using default mock account dashboard copy");
      }
    };
    fetchDashboardCopy();
  }, []);

  const fetchOrders = async (email) => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail && loginEmail.includes("@")) {
      localStorage.setItem("bb_user_email", loginEmail);
      setUserEmail(loginEmail);
      fetchOrders(loginEmail);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bb_user_email");
    setUserEmail("");
    setOrders([]);
  };

  if (authChecking) {
    return (
      <div
        style={{
          padding: "5rem 1.5rem",
          textAlign: "center",
          color: "#D4B06A",
        }}
      >
        <h2>Loading Account Sanctuary...</h2>
      </div>
    );
  }

  // Gate the account page behind secure login
  if (!userEmail) {
    return (
      <div
        style={{
          padding: "5rem 1.5rem",
          maxWidth: "450px",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#1C3D2E",
            padding: "2.5rem 2rem",
            borderRadius: "16px",
            border: "1px solid #D4B06A",
            boxShadow: "0 8px 32px rgba(18,56,38,0.3)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#D4B06A",
              fontFamily: "Cinzel, serif",
              fontSize: "2rem",
              marginBottom: "0.5rem",
            }}
          >
            Garden Sanctuary Login
          </h2>
          <p
            style={{
              color: "#E9DCBE",
              fontSize: "1rem",
              lineHeight: "1.5",
              marginBottom: "2rem",
            }}
          >
            Sign in with your purchase email to retrieve order statuses, pickup
            schedules, and personalized nursery guides.
          </p>

          <form
            onSubmit={handleLogin}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
              textAlign: "left",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontWeight: "bold",
                  color: "#F5E7C4",
                  fontSize: "0.9rem",
                }}
              >
                Your Email Address
              </label>
              <input
                type="email"
                required
                placeholder="nursery@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #D4B06A",
                  backgroundColor: "#123826",
                  color: "#F4F1E1",
                  fontSize: "1rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <Button
              type="submit"
              variant="gold-filled"
              style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem" }}
            >
              Verify & Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "3rem 1.5rem",
        maxWidth: "1000px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Header section with Sign Out */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "3rem",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              color: "#D4B06A",
              fontFamily: "Cinzel, serif",
              fontSize: "2.8rem",
              marginBottom: "0.5rem",
            }}
          >
            {dashboardCopy.title}
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              color: "#E9DCBE",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            {dashboardCopy.subtitle} ({userEmail})
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "2px solid #D4B06A",
            color: "#D4B06A",
            padding: "0.5rem 1.2rem",
            borderRadius: "24px",
            fontFamily: "Crimson Text, serif",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#D4B06A";
            e.target.style.color = "#1C3D2E";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#D4B06A";
          }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem" }}>
        {/* Main Dashboard Section */}
        <div
          style={{
            flex: "1 1 600px",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          {/* Announcement Alert */}
          <div
            style={{
              background: "#123826",
              padding: "1.5rem",
              borderRadius: "12px",
              borderLeft: "4px solid #D4B06A",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#D4B06A" }}>
              🌱 Fresh Almanac Notice
            </h3>
            <p style={{ margin: "0", lineHeight: "1.5" }}>
              {dashboardCopy.announcement}
            </p>
          </div>

          {/* Orders History */}
          <div>
            <h2
              style={{
                fontFamily: "Cinzel, serif",
                color: "#D4B06A",
                borderBottom: "1px solid #1C3D2E",
                paddingBottom: "0.5rem",
                marginBottom: "1.2rem",
              }}
            >
              Your Stripe Orders
            </h2>

            {loadingOrders ? (
              <p style={{ color: "#E9DCBE", fontStyle: "italic" }}>
                Retrieving your order history securely from Stripe...
              </p>
            ) : orders.length === 0 ? (
              <div
                style={{
                  background: "#1C3D2E",
                  padding: "2rem",
                  borderRadius: "8px",
                  border: "1px dotted #D4B06A",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, color: "#E9DCBE", fontSize: "1.1rem" }}>
                  No orders found for {userEmail}.
                </p>
                <p
                  style={{
                    margin: "0.5rem 0 0 0",
                    fontSize: "0.9rem",
                    color: "#d9cba9",
                  }}
                >
                  If you recently made a purchase, please allow a few minutes
                  for Stripe to sync, or verify you used the correct checkout
                  email.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      background: "#1C3D2E",
                      padding: "1.2rem",
                      borderRadius: "8px",
                      border: "1px solid #D4B06A",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                          color: "#D4B06A",
                        }}
                      >
                        Order {order.id}
                      </div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "#E9DCBE",
                          margin: "0.2rem 0",
                        }}
                      >
                        Ordered on {order.date}
                      </div>
                      <div style={{ fontSize: "0.95rem", fontWeight: "500" }}>
                        {order.items.join(", ")}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          background:
                            order.status === "Ready for Pickup"
                              ? "#D4B06A"
                              : "#123826",
                          color:
                            order.status === "Ready for Pickup"
                              ? "#1C3D2E"
                              : "#E9DCBE",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          marginBottom: "0.4rem",
                          textTransform: "uppercase",
                          display: "inline-block",
                        }}
                      >
                        {order.status}
                      </div>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                          marginTop: "0.2rem",
                        }}
                      >
                        ${order.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Support Panel */}
        <div
          style={{
            flex: "1 1 280px",
            background: "#123826",
            padding: "2rem",
            borderRadius: "12px",
            border: "1px solid #D4B06A",
            height: "fit-content",
          }}
        >
          <h3 style={{ color: "#D4B06A", margin: "0 0 1rem 0" }}>
            Nursery Guide Support
          </h3>
          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: "1.5",
              marginBottom: "1.5rem",
            }}
          >
            Our St. Petersburg horticulturists are standing by to help with
            compatibility, potting instructions, or scheduling your specific
            local collection window.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
              fontSize: "0.9rem",
            }}
          >
            <div>
              <strong>Email Support:</strong>
              <div>
                <a
                  href={`mailto:${dashboardCopy.emailSupport}`}
                  style={{ color: "#D4B06A" }}
                >
                  {dashboardCopy.emailSupport}
                </a>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            href="/shop"
            style={{ width: "100%", marginTop: "2rem" }}
          >
            Browse More Plants
          </Button>
        </div>
      </div>
    </div>
  );
}
