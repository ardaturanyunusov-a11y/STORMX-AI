// Vercel Serverless Function
// This runs on the SERVER, never in the user's browser.
// Your Gemini API key lives only here, as an environment variable.
// It is never sent to, or visible from, the client.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Yalnız POST icazəlidir' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server tərəfində GEMINI_API_KEY təyin olunmayıb.' });
    return;
  }

  const { contents } = req.body || {};
  if (!Array.isArray(contents)) {
    res.status(400).json({ error: 'contents massivi tələb olunur' });
    return;
  }

  try {
    const upstream = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.7 }
        })
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: data?.error?.message || 'Google API xətası' });
      return;
    }

    const candidate = data.candidates && data.candidates[0];
    const replyText = candidate?.content?.parts?.map(p => p.text || '').join('') || null;

    if (!replyText) {
      res.status(502).json({ error: 'Model cavab qaytarmadı' });
      return;
    }

    res.status(200).json({ reply: replyText });

  } catch (err) {
    res.status(500).json({ error: 'Server xətası: ' + err.message });
  }
}
