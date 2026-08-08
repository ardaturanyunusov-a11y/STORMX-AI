export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { contents } = req.body;
        
        const systemInstruction = {
            role: "user",
            parts: [{ text: "Sən STORMX AI-san. İstifadəçi hansı dildə yazır-yazsın, hər zaman yalnız və yalnız Azərbaycan dilində cavab verməlisən." }]
        };

        const fullContents = [systemInstruction, ...(Array.isArray(contents) ? contents : [{ role: "user", parts: [{ text: contents }] }])];

        const upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: fullContents })
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
