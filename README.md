# Agent Console — server tərəfində gizli API açarı ilə

Bu qurluşda Gemini API açarı YALNIZ serverdə saxlanılır. İstifadəçi
(sizin sayta girən hər kəs) heç bir açar, heç bir Gmail girişi görmür —
sadəcə açır və yazır.

## Necə işləyir

```
Brauzer (public/index.html)
      │  POST /api/chat  { contents: [...] }
      ▼
Server funksiyası (api/chat.js)
      │  GEMINI_API_KEY mühit dəyişənini oxuyur
      │  Google-a sorğu göndərir
      ▼
Google Gemini API
```

Açar heç vaxt brauzerə, heç vaxt istifadəçinin gördüyü koda düşmür.

## Yayımlama (Vercel ilə, pulsuz)

1. [vercel.com](https://vercel.com) saytında pulsuz hesab açın (GitHub
   hesabınızla daxil ola bilərsiniz).
2. Bu qovluğu GitHub-a yükləyin (yeni repo yaradıb bu faylları push edin),
   və ya Vercel CLI ilə birbaşa deploy edin:
   ```
   npm install -g vercel
   cd agent-server
   vercel
   ```
3. Vercel layihə paneldə **Settings → Environment Variables** bölməsinə
   gedin və əlavə edin:
   - Adı: `GEMINI_API_KEY`
   - Dəyəri: Google AI Studio-dan aldığınız açar (`AIzaSy...`)
4. Yenidən deploy edin (`vercel --prod`, ya da panel üzərindən "Redeploy").
5. Verilən linki (məs. `https://sizin-layiheniz.vercel.app`) açın —
   agent hazırdır, heç bir giriş tələb etmir.

## Qeyd

- `GEMINI_API_KEY`-i heç vaxt `public/` qovluğundakı fayllara yazmayın —
  o fayllar brauzerə açıq göndərilir.
- İstəsəniz eyni quruluşu Railway, Render və ya Cloudflare Pages üzərində
  də saxlaya bilərsiniz — sadəcə `api/chat.js`-i həmin platformanın
  serverless funksiya formatına uyğunlaşdırmaq lazımdır.
