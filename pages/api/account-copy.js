export default function AccountCopyApi(req, res) {
  res.status(200).json({
    title: "Your Garden Sanctuary",
    subtitle: "Welcome back to your Botanical Bazaar sanctuary",
    emailSupport: "info@thebotanicalbazaar.com"
  });
}
