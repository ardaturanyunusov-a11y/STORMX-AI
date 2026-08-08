// Vercel Serverless Function
// This runs on the SERVER, never in the user's browser.
// Your Gemini API key lives only here, as an environment variable.
 
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
 
  const { contents, mode } = req.body || {};
  if (!Array.isArray(contents)) {
    res.status(400).json({ error: 'contents massivi tələb olunur' });
    return;
  }
 
  const isImageMode = mode === 'image';
  const model = isImageMode ? 'gemini-2.5-flash-image' : 'gemini-3.6-flash';
 
  const generationConfig = isImageMode
    ? { responseModalities: ['TEXT', 'IMAGE'] }
    : {};
 
  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({ contents, generationConfig })
      }
    );
 
    const data = await upstream.json();
 
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: data?.error?.message || 'Google API xətası' });
      return;
    }
 
    const candidate = data.candidates && data.candidates[0];
    const responseParts = candidate?.content?.parts || [];
 
    let replyText = '';
    let imageDataUrl = null;
 
    for (const part of responseParts) {
      if (part.text) replyText += part.text;
      if (part.inlineData && part.inlineData.data) {
        const mt = part.inlineData.mimeType || 'image/png';
        imageDataUrl = `data:${mt};base64,${part.inlineData.data}`;
      }
    }
 
    if (!replyText && !imageDataUrl) {
      res.status(502).json({ error: 'Model cavab qaytarmadı' });
      return;
    }
 
    res.status(200).json({ reply: replyText, image: imageDataUrl });
 
  } catch (err) {
    res.status(500).json({ error: 'Server xətası: ' + err.message });
  }
}
 
