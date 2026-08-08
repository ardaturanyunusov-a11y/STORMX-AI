export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Yalnız POST icazəlidir' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server tərəfində GEMINI_API_KEY təyin olunmayıb.' });
    }

    const { contents } = req.body || {};
    if (!Array.isArray(contents)) {
        return res.status(400).json({ error: 'contents massivi tələb olunur' });
    }

    // Ən stabil işləyən rəsmi model
    const model = 'gemini-2.5-flash';

    try {
        const upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contents })
            }
        );

        const data = await upstream.json();
        
        if (!upstream.ok) {
            return res.status(upstream.status).json(data);
        }

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
