import fs from 'fs';
import path from 'path';

export default async function notifyMeHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, slug, name, type } = req.body || {};

  // Simple non-backtracking email validation check
  const isSimpleEmail = (str) => {
    if (typeof str !== 'string' || str.length > 254) return false;
    const atIdx = str.indexOf('@');
    if (atIdx < 1 || atIdx !== str.lastIndexOf('@')) return false;
    const dotIdx = str.lastIndexOf('.');
    if (dotIdx <= atIdx + 1 || dotIdx === str.length - 1) return false;
    return !/\s/.test(str);
  };

  // Validate and sanitize email
  if (!email || !isSimpleEmail(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  // Validate and sanitize product details
  if (
    !slug ||
    typeof slug !== 'string' ||
    !slug.trim() ||
    !name ||
    typeof name !== 'string' ||
    !name.trim()
  ) {
    return res.status(400).json({ error: 'Valid product details (slug and name) are required.' });
  }

  const cleanEmail = email.trim();
  const cleanSlug = slug.trim();
  const cleanName = name.trim();
  const cleanType = typeof type === 'string' && type.trim() ? type.trim() : 'restock_notification';

  try {
    const dirPath = path.join(process.cwd(), 'content');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, 'restock-requests.json');
    let requests = [];

    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        requests = JSON.parse(fileContent);
      } catch (e) {
        console.error('Error reading/parsing existing restock requests file, resetting:', e);
      }
    }

    const newRequest = {
      email: cleanEmail,
      slug: cleanSlug,
      name: cleanName,
      type: cleanType,
      timestamp: new Date().toISOString()
    };

    requests.push(newRequest);

    fs.writeFileSync(filePath, JSON.stringify(requests, null, 2), 'utf8');

    console.log(`[Notify Me Capture] Registered request successfully for ${cleanEmail} on ${cleanName} (${cleanSlug}) [type: ${newRequest.type}]`);

    return res.status(200).json({
      success: true,
      message: "You're on the list! We'll email you the moment this specimen returns."
    });
  } catch (error) {
    console.error('[Notify Me Capture] Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
