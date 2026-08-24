export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  }

  const host = 'thebotanicalbazaar.com';
  const apiKey = process.env.INDEXNOW_KEY || '3622345345b3458196615c18b7080335';
  const keyLocation = `https://${host}/${apiKey}.txt`;

  let urlList = [];

  if (req.method === 'POST') {
    const { url, urls } = req.body || {};
    if (url) urlList.push(url);
    if (Array.isArray(urls)) urlList.push(...urls);
  }

  if (urlList.length === 0) {
    urlList = [
      `https://${host}/`,
      `https://${host}/shop`,
      `https://${host}/about`,
      `https://${host}/almanac`,
      `https://${host}/events`
    ];
  }

  // Ensure absolute URLs
  urlList = urlList.map(u => u.startsWith('http') ? u : `https://${host}${u.startsWith('/') ? u : '/' + u}`);

  const payload = {
    host,
    key: apiKey,
    keyLocation,
    urlList
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 200 || response.status === 202) {
      return res.status(200).json({
        success: true,
        message: 'IndexNow submission successful',
        submittedUrls: urlList,
        status: response.status
      });
    } else {
      const text = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `IndexNow API returned status ${response.status}`,
        details: text
      });
    }
  } catch (error) {
    console.error('IndexNow submission error:', error);
    return res.status(500).json({ error: 'Failed to submit URLs to IndexNow' });
  }
}
