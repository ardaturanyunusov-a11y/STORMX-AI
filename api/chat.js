export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { history, language } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const selectedLang = language || 'AZ';

        const systemInstruction = {
            role: "user",
            parts: [{ text: `Sən BUTA AI-san. Cari seçilmiş dil budur: "${selectedLang}". Qısa, səliqəli və texniki dildə cavab ver.` }]
        };

        // İstifadəçinin göndərdiyi bütün tarixçəni (bazanı) bura yığırıq
        const fullContents = [systemInstruction, ...(Array.isArray(history) ? history : [])];

        const upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: fullContents })
            }
        );

        const data = await upstream.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Server xətası' });
    }
}
