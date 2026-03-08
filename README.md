# Linksy Chat — Beta

Discord/Telegram/Guilded/Revolt karışımı Türk alternatif mesajlaşma platformu.

## Kurulum

```bash
npm install
npm run dev
```

## Build & Deploy (Vercel)

```bash
npm run build
# veya Vercel CLI ile:
vercel --prod
```

## Proje Yapısı

```
src/
  components/    # UI bileşenleri
  context/       # React context (state yönetimi)
  data/          # Mock veri
  types/         # TypeScript tipleri
  index.css      # Global CSS değişkenleri
  main.tsx       # Giriş noktası
  App.tsx        # Kök bileşen
```

## Beta Notları

Bu beta sürümünde backend entegrasyonu yoktur. Tüm veri mock'tur.
Gerçek WebRTC için LiveKit entegrasyonu roadmap'te.
