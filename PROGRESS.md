# TrackMate – Proje İlerlemesi

Bu doküman, TrackMate projesindeki haftalık geliştirme adımlarını ve yapılan değişiklikleri detaylıca belgeler.

---

## ✅ Hafta 1 – Proje Planlaması, Mimari ve Hazırlık

**Tamamlanma Tarihi:** Mart 2026

### Yapılan Çalışmalar

| Konu | Durum | Açıklama |
|---|---|---|
| GitHub Reposu | ✅ Tamamlandı | `huseyinuzum/TrackMate` reposu oluşturuldu ve ilk commit atıldı |
| README.md | ✅ Tamamlandı | Proje vizyonu, özellikler, teknoloji yığını ve 10 haftalık plan eklendi |
| Veritabanı Tasarımı | ✅ Tamamlandı | PostgreSQL için 5 tablo tasarlandı (ER diyagramı + DDL SQL) |
| Mimari Diyagramlar | ✅ Tamamlandı | Sistem mimarisini, veri akışını ve kullanıcı yolculuğunu anlatan Mermaid diyagramları |

### Oluşturulan Dosyalar
- `README.md` – Kapsamlı proje tanıtım dökümanı
- `database_schema.md` – PostgreSQL ER diyagramı ve CREATE TABLE scriptleri
- `architecture_diagrams.md` – Flowchart, Sequence, Use Case ve ER diyagramları

---

## ✅ Hafta 2 – Temel Backend İskeleti ve Kimlik Doğrulama (Auth) Sistemi

**Tamamlanma Tarihi:** Mart 2026

### Yapılan Çalışmalar

| Modül | Durum | Teknoloji |
|---|---|---|
| Backend İskelet Yapısı | ✅ Tamamlandı | FastAPI, Python 3.11+ |
| Veritabanı Bağlantısı | ✅ Tamamlandı | SQLAlchemy 2.0 (async) + asyncpg |
| ORM User Modeli | ✅ Tamamlandı | SQLAlchemy mapped_column + UUID PK |
| Pydantic Şemaları | ✅ Tamamlandı | RegisterRequest, LoginRequest, TokenResponse, UserResponse |
| Şifre Hashleme | ✅ Tamamlandı | passlib + bcrypt |
| JWT Token Sistemi | ✅ Tamamlandı | python-jose HS256, expire süreli token |
| Auth Endpoint'leri | ✅ Tamamlandı | POST /register, POST /login, GET /me |
| Alembic Migration | ✅ Tamamlandı | async engine destekli migration yapısı |
| Proje Konfigürasyonu | ✅ Tamamlandı | Pydantic Settings ile .env okuma |

### Oluşturulan Dosyalar

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              ← FastAPI uygulama giriş noktası, CORS, router kayıtları
│   ├── config.py            ← Pydantic Settings (.env → tip güvenli ayarlar)
│   ├── database.py          ← SQLAlchemy async engine + get_db dependency
│   ├── models/
│   │   └── user.py          ← SQLAlchemy 2.0 User ORM modeli (UUID, timestamps)
│   ├── schemas/
│   │   └── user.py          ← Pydantic v2 istek/yanıt şemaları
│   ├── routers/
│   │   └── auth.py          ← /register, /login, /me endpoint'leri
│   └── services/
│       └── auth_service.py  ← Hash, JWT ve DB CRUD iş mantığı
├── alembic/
│   ├── env.py               ← async migration ortamı, .env entegrasyonu
│   └── script.py.mako       ← Migration şablon dosyası
├── alembic.ini              ← Alembic konfigürasyonu
├── requirements.txt         ← Python bağımlılıkları
└── .env.example             ← Ortam değişkeni şablonu
```

### Önemli Teknik Kararlar

- **SQLAlchemy 2.0 Async:** Yüksek eş zamanlılık gerektiren rota optimizasyon sorgularına hazırlık ile `AsyncSession` kullanıldı.
- **UUID Primary Key:** Dağıtık sistemlere uygun, güvenli ve tahmin edilemez kimlik yapısı.
- **JWT (HS256):** Stateless token yapısı; ileride Redis ile oturum yönetimi eklenebilecek şekilde tasarlandı.
- **Alembic Async Desteği:** `asyncio.run(run_async_migrations())` ile async engine migration desteği sağlandı.
- **Pydantic v2 `model_validate`:** ORM nesnelerini şemaya dönüştürmek için `from_attributes=True` config ile `model_validate` kullanıldı.

---

## ✅ Hafta 3 – NLP Modülü Geliştirmesi

**Tamamlanma Tarihi:** Nisan 2026

### Yapılan Çalışmalar

| Modül | Durum | Teknoloji |
|---|---|---|
| OpenAI API Kurulumu | ✅ Tamamlandı | `openai` kütüphanesi, `gpt-4o-mini` modeli |
| Prompt Engineering | ✅ Tamamlandı | Metinden zaman, bütçe, konum, kategori çıkarımı (JSON çıktı) |
| NLP Servisi | ✅ Tamamlandı | Pydantic modelleri (`NLPParseRequest`, `NLPParseResponse`) |
| API Endpoint'i | ✅ Tamamlandı | `POST /api/v1/nlp/parse` (Auth Korumalı) |

### Oluşturulan Dosyalar
- `backend/app/schemas/nlp.py`
- `backend/app/services/nlp_service.py`
- `backend/app/routers/nlp.py`

---

## ✅ Hafta 4 – Harita API'leri ve Mekan Keşfi

**Tamamlanma Tarihi:** Nisan 2026

### Yapılan Çalışmalar

| Modül | Durum | Teknoloji |
|---|---|---|
| Places Veritabanı Modeli | ✅ Tamamlandı | SQLAlchemy (UUID, Koordinatlar, Index) |
| Google Maps API Entegrasyonu | ✅ Tamamlandı | `httpx` ile asenkron Text Search API isteği |
| Mekan Cache Sistemi | ✅ Tamamlandı | Veritabanında kontrol, yoksa kaydetme (get_or_create) |
| API Endpoint'i | ✅ Tamamlandı | `POST /api/v1/places/search` (Auth Korumalı) |

### Oluşturulan Dosyalar
- `backend/app/models/place.py`
- `backend/app/schemas/place.py`
- `backend/app/services/maps_service.py`
- `backend/app/routers/places.py`


---

## 🔜 Hafta 5-6 – Graf Algoritması ve Rota Optimizasyonu

**Planlanan Kapsam:**
- Distance Matrix API entegrasyonu
- Graf modellemesi (networkx veya custom)
- Dijkstra/VRP tabanlı rota oluşturucu
- Zaman ve bütçe kısıtlayıcıları

---

## 🔜 Hafta 7-8 – Frontend & Mobil Geliştirmesi

**Planlanan Kapsam:**
- Web (Next.js) ve Mobil (React Native CLI) projelerinin kurulumu
- Auth ekranları (Login / Register) her iki platform için
- Metin giriş arayüzü ve harita bileşeni (react-native-maps / Google Maps JS)
- Rota sonuç kartlarının UI tasarımı ve API entegrasyonu

---

## 🔜 Hafta 9-10 – Testler ve Deploy

**Planlanan Kapsam:**
- Backend birim testleri (pytest + httpx)
- Frontend entegrasyon testleri
- Render (Backend) + Vercel (Frontend) deploy
- Production ortamı konfigürasyonu
