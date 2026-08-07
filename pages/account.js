import React, { useState, useEffect } from 'react';
import Button from '../components/Button';

export default function Account() {
  const [dashboardCopy, setDashboardCopy] = useState({
    title: 'Your Garden Sanctuary',
    subtitle: 'Welcome back to your Botanical Bazaar sanctuary',
    announcement: 'Special Offer: Bring your soil samples for free analysis during our upcoming weekend events!',
    phoneSupport: 'Questions? Reach out to our guides at (727) 555-0199',
    emailSupport: 'guides@thebotanicalbazaar.com'
  });

  const [orders, setOrders] = useState([
    {
      id: 'BB-9831',
      date: 'May 12, 2025',
      total: 85.00,
      status: 'Ready for Pickup',
      items: ['Bunchosia Glandulifera (Peanut Butter Fruit) - 6" Pot']
    },
    {
      id: 'BB-9610',
      date: 'March 04, 2025',
      total: 55.00,
      status: 'Completed',
      items: ["Monstera Adansonii 'Swiss Cheese'"]
    }
  ]);

  useEffect(() => {
    // Attempt dynamic fetch from Sanity configuration (or fallback to local mock config)
    const fetchDashboardCopy = async () => {
      try {
        const res = await fetch('/api/account-copy');
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            setDashboardCopy(data);
          }
        }
      } catch (e) {
        console.log('Using default mock account dashboard copy');
      }
    };
    fetchDashboardCopy();
  }, []);

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: '#D4B06A', fontFamily: 'Georgia, serif', fontSize: '2.8rem', marginBottom: '0.5rem' }}>
          {dashboardCopy.title}
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#E9DCBE', fontStyle: 'italic' }}>
          {dashboardCopy.subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem' }}>
        {/* Main Dashboard Section */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Announcement Alert */}
          <div style={{ background: '#123826', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #D4B06A' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#D4B06A' }}>🌱 Fresh Almanac Notice</h3>
            <p style={{ margin: '0', lineHeight: '1.5' }}>{dashboardCopy.announcement}</p>
          </div>

          {/* Orders History */}
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', color: '#D4B06A', borderBottom: '1px solid #1C3D2E', paddingBottom: '0.5rem', marginBottom: '1.2rem' }}>
              Your Pickup Orders
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map(order => (
                <div
                  key={order.id}
                  style={{
                    background: '#1C3D2E',
                    padding: '1.2rem',
                    borderRadius: '8px',
                    border: '1px solid #D4B06A',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#D4B06A' }}>Order {order.id}</div>
                    <div style={{ fontSize: '0.9rem', color: '#E9DCBE', margin: '0.2rem 0' }}>Ordered on {order.date}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>
                      {order.items.join(', ')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      background: order.status === 'Ready for Pickup' ? '#D4B06A' : '#123826',
                      color: order.status === 'Ready for Pickup' ? '#1C3D2E' : '#E9DCBE',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      marginBottom: '0.4rem',
                      textTransform: 'uppercase'
                    }}>
                      {order.status}
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${order.total.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Support Panel */}
        <div style={{ flex: '1 1 280px', background: '#123826', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A', height: 'fit-content' }}>
          <h3 style={{ color: '#D4B06A', margin: '0 0 1rem 0' }}>Nursery Guide Support</h3>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            Our St. Petersburg horticulturists are standing by to help with compatibility, potting instructions, or scheduling your specific local collection window.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
            <div>
              <strong>Call/Text:</strong>
              <div>{dashboardCopy.phoneSupport}</div>
            </div>
            <div>
              <strong>Email Support:</strong>
              <div><a href={`mailto:${dashboardCopy.emailSupport}`} style={{ color: '#D4B06A' }}>{dashboardCopy.emailSupport}</a></div>
            </div>
          </div>

          <Button variant="outline" href="/shop" style={{ width: '100%', marginTop: '2rem' }}>
            Browse More Plants
          </Button>
        </div>
      </div>
    </div>
  );
}
