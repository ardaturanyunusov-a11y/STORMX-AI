export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { history, language } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing on Vercel.' });
        }

        const selectedLang = language || 'AZ';

        // Tarixçəni Gemini API-nin qəbul edəcəyi təmiz formata salırıq
        const formattedHistory = Array.isArray(history) ? history.map(item => ({
            role: item.role === 'model' ? 'model' : 'user',
            parts: item.parts
        })) : [];

        const payload = {
            system_instruction: {
                parts: [{ text: `Sən BUTA AI adlı qabaqcıl neyron intellekt sistemisən. Qısa, səliqəli, dəqiq və texniki dildə cavab ver. Seçilmiş dil: ${selectedLang}.` }]
            },
            contents: formattedHistory
        };

        const upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );

        const data = await upstream.json();
        
        if (data.error) {
            return res.status(500).json({ error: data.error.message || 'Gemini API Error' });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
