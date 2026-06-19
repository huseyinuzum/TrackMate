# TrackMate - Ara Değerlendirme (Midterm) Sunum Metni

**Proje Adı:** TrackMate - Yapay Zeka Destekli Akıllı Rota Planlama Platformu
**Mevcut Aşama:** Backend & Yapay Zeka & Optimizasyon Tamamlandı (Hafta 6)

---

## 🎤 Giriş (Projenin Amacı)
Herkese merhaba. Bugün sizlere kullanıcıların günlük zaman, bütçe ve ilgi alanı tercihlerini yapay zeka ile analiz edip, en optimize gezi rotasını saniyeler içinde çıkaran akıllı asistanımız **TrackMate**'in ara dönem ilerlemesini sunacağım. Projemizin çekirdeğini oluşturan zorlu arka plan, yapay zeka ve algoritma kısımlarını tamamen bitirmiş durumdayız.

Şimdi hafta hafta neler yaptığımıza kısaca göz atalım:

---

## 🏗️ Hafta 1-2: Temel Mimari ve Güvenlik Sistemi
*İlk iki haftada projenin omurgasını inşa ettik.*
- **Mimari:** Yüksek performanslı ve asenkron çalışabilen **FastAPI (Python)** altyapısını kurduk.
- **Veritabanı:** Güçlü ilişkisel yapısı sebebiyle **PostgreSQL** kullandık. Mekanlar, Rotalar, Kullanıcılar gibi tüm tabloların Entity-Relationship (ER) şemalarını oluşturduk ve `Alembic` ile migration altyapısını hazırladık.
- **Güvenlik (Auth):** `bcrypt` ile şifre kriptolama ve standartların üzerinde güvenli **JWT (JSON Web Token)** tabanlı yetkilendirme (Login/Register) sistemini başarıyla test edip yayına aldık.

---

## 🧠 Hafta 3: Yapay Zeka (NLP) Modülü
*Uygulamamızı akıllı kılan NLP kısmını geliştirdik.*
- **OpenAI Entegrasyonu:** Kullanıcıların "Kadıköy'de 3 saatim var, 500 TL bütçem var, tarihi bir yer ve kahveci istiyorum" gibi serbest metinlerini (doğal dil) anlamlandıracak NLP modülünü geliştirdik.
- **Prompt Engineering:** Özel promtlar (komutlar) ile OpenAI API üzerinden gelen bu dağınık metinlerin anında **Zaman, Bütçe, Konum ve Kategori** şeklinde ayrıştırılmış yapısal bir JSON'a dönüştürülmesini sağladık.

---

## 📍 Hafta 4: Harita Entegrasyonu ve Mekan Keşfi
*Gerçek dünya verilerini projemize dahil ettik.*
- **Google Places API:** NLP'den çıkan sonuçlara (örn: tarihi mekanlar) uygun yerleri asenkron olarak (`httpx` ile) Google Haritalar üzerinden çeken modülü yazdık.
- **Akıllı Cache (Önbellek) Sistemi:** Aynı mekanlar için Google API'ye defalarca istek atıp maliyet yaratmamak adına, bulunan mekanları kendi veritabanımızdaki `places` tablosuna benzersiz kimlikleriyle (ID) kaydeden bir sistem kurduk.

---

## ⚡ Hafta 5-6: Graf Algoritması ve Rota Optimizasyonu
*Projenin en teknik ve can alıcı kısmını bitirdik.*
- **Distance Matrix API:** Aday mekanların birbirleri arasındaki gerçek yürüyüş/yolculuk sürelerini Google üzerinden hesapladık.
- **Graf Modellemesi:** Mekanları bir ağın düğümleri (nodes), aralarındaki mesafeleri ise bağlantılar (edges) olarak modellemek için `networkx` kütüphanesini kullandık.
- **Açgözlü (Greedy) Algoritma:** Mekanların reyting değerlerini maksimize ederken, kullanıcının bize verdiği **"Maksimum Süre" (örn: 3 saat)** kısıtını aşmayan en optimal rotayı çizen algoritmayı başarıyla geliştirdik. Sistem, her mekan için varış ve kalkış saatlerini bile otomatik hesaplıyor.

---

## 🚀 Mevcut Durum ve Gelecek Planı (Hafta 7-8)
**Şu an neredeyiz?**
TrackMate'in tüm beyin takımı (Backend, Auth, Yapay Zeka, Harita API'leri ve Rota Optimizasyon Algoritması) uçtan uca, birbirine bağlı ve sorunsuz çalışıyor.

**Sırada Ne Var?**
Planlamamızın son ayağı olan **Hafta 7 ve 8'de** ise geliştirdiğimiz bu güçlü sistemi kullanıcıyla buluşturacağız. Web için **Next.js**, Mobil için **React Native** kullanarak kullanıcı dostu ekranları ve harita arayüzünü (UI/UX) tasarlamaya başlayacağız.

Dinlediğiniz için teşekkürler!
