import React from 'react';

export default function AccountCopyApi(req, res) {
  res.status(200).json({
    title: 'Your Garden Sanctuary',
    subtitle: 'Welcome back to your Botanical Bazaar sanctuary',
    announcement: 'Special Offer: Bring your soil samples for free analysis during our upcoming weekend events!',
    emailSupport: 'help@thebotanicalbazaar.com'
  });
}
