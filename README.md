<div align="center">
  <h1>🗺️ TrackMate</h1>
  <p><strong>Yapay Zeka Destekli, Optimize Edilmiş Akıllı Rota Planlama Platformu</strong></p>
</div>

---

## 📖 Proje Hakkında

**TrackMate**, kullanıcıların günlük zaman, bütçe ve ilgi alanı tercihlerini analiz ederek en uygun günlük gezi/etkinlik rotasını çıkaran akıllı bir planlama asistanıdır. Kullanıcıların serbest metin olarak girdiği istekleri (örn: *"Öğleden sonra 3 saat vaktim var, tarihi bir yer görmek ve ardından kahve içmek istiyorum, toplam bütçem 500 TL"*) Doğal Dil İşleme (NLP) ile algılar. Ardından dış harita API'leri (Google Maps/Foursquare) üzerinden uygun mekanları bularak, zaman ve mesafe maliyetlerini graf algoritmalarıyla minimize eder ve kişiselleştirilmiş rota planını harita üzerinde sunar.

## ✨ Temel Özellikler

- **🧠 Yapay Zeka (NLP) Destekli Girdi:** Kullanıcıların doğal ve gündelik bir dille isteklerini belirtebilmesi (LLM/Prompt Engineering).
- **📍 Akıllı Mekan Keşfi:** Belirtilen bütçe, zaman ve kategorilere en uygun mekanların dış harita API'leri ile bulunması.
- **⚡ Graf Tabanlı Rota Optimizasyonu:** Gezgin Satıcı Problemi (TSP/VRP) benzeri yaklaşımlarla seyahat süresini ve harcanacak zamanı en optimize hale getiren rota çizimi.
- **🗺️ Etkileşimli Harita Arayüzü:** Oluşturulan rotanın duraklarıyla birlikte harita üzerinde anlık görüntülenmesi ve zaman çizelgesi.
- **⚙️ Kişiselleştirilmiş Profiller:** Sık kullanılan "Hafta sonu kafa dinleme" veya "Hızlı turist rotası" gibi tercih şablonlarının kaydedilmesi.

## 🛠 Kullanılacak Teknolojiler (Tech Stack)

Proje, 10 haftalık geliştirme sürecine uygun olarak yenilikçi teknolojilerle donatılmıştır:

- **Backend:** Python, FastAPI
- **Frontend:** React, Next.js, TailwindCSS
- **Veritabanı:** PostgreSQL, Prisma (veya SQLAlchemy)
- **Yapay Zeka:** OpenAI API / LangChain (Niyet çıkarımı için)
- **Harita/Konum API:** Google Maps Platform (Places API, Distance Matrix API) / Mapbox
- **DevOps:** Docker, Vercel (Frontend), Render/AWS (Backend)

## 📅 Geliştirme Takvimi (10 Hafta)

- **Hafta 1-2:** Proje mimarisinin kurulması, Veritabanı tasarımı ve Temel API iskeleti (Auth).
- **Hafta 3:** NLP Modülünün geliştirilmesi ve prompt entegrasyonu.
- **Hafta 4:** Dış API'ler ile (Google Places vb.) mekan filtreleme ve getirme işlemleri.
- **Hafta 5-6:** Graf modellemesi, Dijkstra/A* kurgusu ve Rotanın optimize edilmesi (Kısıtlayıcılar: Zaman, Bütçe).
- **Hafta 7:** Frontend geliştirmelerine başlanması, UI/UX tasarımı.
- **Hafta 8:** Uçtan uca harita arayüzü entegrasyonu ve rota çizimi.
- **Hafta 9:** Birim, edge case ve performans testleri. Bug-fixing.
- **Hafta 10:** Üretim (Production) ortamına deploy işlemleri ve dokümantasyon tamamlanması.

## 🚀 Başlangıç

Bu depodaki kodlar geliştirme aşamasındadır. Lokal bilgisayarınızda kurmak için aşağıdaki adımları (şu an için yapım aşamasında) takip edebilirsiniz:

```bash
# Repoyu klonlayın
git clone https://github.com/huseyinuzum/TrackMate.git
cd TrackMate

# Geliştirme adımları ve çalıştırma detayları yakında eklenecektir.
```

## 📝 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır.
