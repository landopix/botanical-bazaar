import { sanityClient } from '../../lib/sanity';

export default async function AccountCopyApi(req, res) {
  try {
    if (sanityClient) {
      const query = `*[_type == "accountDashboardCopy"][0]{
        title,
        subtitle,
        announcement,
        phoneSupport,
        emailSupport
      }`;
      const data = await sanityClient.fetch(query);
      if (data && data.title) {
        return res.status(200).json(data);
      }
    }
  } catch (err) {
    console.warn('Sanity accountDashboardCopy query error:', err.message);
  }

  return res.status(200).json({
    title: "Account & Order Tracking",
    subtitle: "Guest checkout remains primary for all nursery purchases. Use our passwordless email authentication or guest tracker below to manage your order details.",
    emailSupport: "info@thebotanicalbazaar.com"
  });
}
