export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { contents, language } = req.body;
        
        // Seçilmiş dili təyin edirik (əgər göndərilməyibsə standart AZ olur)
        const selectedLang = language || 'AZ';
        
        const systemInstruction = {
            role: "user",
            parts: [{ text: `Sən STORMX AI-san. Cari seçilmiş dil budur: "${selectedLang}". 
1. Əgər istifadəçinin yazdığı mətn seçilmiş dilə uyğundursa, yalnız və yalnız həmin seçilmiş dildə cavab ver.
2. Əgər istifadəçi seçilmiş dildən başqa bir dildə yazarsa, süni intellekt heç bir digər cavab vermədən dərhal mütləq bu cümləni işlətsin: "Xahiş edirik, yuxarıdan danışdığınız dili seçin." (Əgər seçilmiş dil İngilis dilidirsə "Please select the language you are speaking from above", Rus dilidirsə "Пожалуйста, выберите язык, на котором вы говорите, сверху", Azərbaycan dilidirsə "Xahiş edirik, yuxarıdan danışdığınız dili seçin").` }]
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
