function isSimpleEmail(str) {
  if (typeof str !== "string") return false;
  const email = str.trim();
  if (!email || email.length > 254 || email.includes(" ")) return false;
  const atIndex = email.indexOf("@");
  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@") || atIndex === email.length - 1) return false;
  const domain = email.slice(atIndex + 1);
  const dotIndex = domain.indexOf(".");
  return dotIndex > 0 && dotIndex < domain.length - 1;
}

export default async function notifyMeHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, slug, name, type } = req.body || {};

  if (!email || typeof email !== 'string' || !isSimpleEmail(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (!slug || typeof slug !== 'string' || !name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Product details are required.' });
  }

  const cleanEmail = email.trim().slice(0, 254);
  const cleanSlug = slug.trim().slice(0, 200);
  const cleanName = name.trim().slice(0, 200);
  const cleanType = typeof type === 'string' && type.trim() ? type.trim().slice(0, 50) : 'restock_notification';

  console.log(`[Notify Me Capture] Registered request successfully for ${cleanEmail} on ${cleanName} (${cleanSlug}) [type: ${cleanType}]`);

  return res.status(200).json({
    success: true,
    message: "You're on the list! We'll email you the moment this specimen returns."
  });
}
