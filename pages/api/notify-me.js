import fs from 'fs';
import path from 'path';

export default async function notifyMeHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, slug, name, type } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  if (!slug || !name) {
    return res.status(400).json({ error: 'Product details are required.' });
  }

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
      email: email.trim(),
      slug,
      name,
      type: type || 'restock_notification',
      timestamp: new Date().toISOString()
    };

    requests.push(newRequest);

    fs.writeFileSync(filePath, JSON.stringify(requests, null, 2), 'utf8');

    console.log('[Notify Me Capture] Registered request successfully for email:', email.trim(), 'name:', name, 'slug:', slug, 'type:', newRequest.type);

    return res.status(200).json({
      success: true,
      message: "You're on the list! We'll email you the moment this specimen returns."
    });
  } catch (error) {
    console.error('[Notify Me Capture] Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
