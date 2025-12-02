# DuckDuck Projesi - Öğrenci Rehberi (Nihat İçin)

Merhaba Nihat! Bu rehber, Yönetim Bilişim Sistemleri öğrencisi olarak projeyi teknik açıdan daha derinlemesine anlaman ve olası darboğazları öngörmen için hazırlandı.

## 1. Stres Testi Senaryoları

Sistemin dayanıklılığını ölçmek için aşağıdaki senaryoları `Locust` veya `JMeter` gibi araçlarla simüle edebilirsin.

### Senaryo A: "Viral Duck" (Okuma Ağırlıklı)
**Durum:** Ünlü bir kullanıcı çok popüler bir Duck attı ve herkes onu görüntülüyor.
- **Simülasyon:** 1000 eşzamanlı kullanıcı.
- **İşlem:** %90 `GET /api/v1/ducks/{id}` (Duck görüntüleme), %10 `POST /api/v1/ducks/{id}/interact` (Like/Retweet).
- **Beklenti:** Redis önbelleklemesi sayesinde veritabanına yük binmemeli.

### Senaryo B: "Maç Sonu" (Yazma Ağırlıklı)
**Durum:** Derbi maçı bitti, herkes aynı anda yorum yazıyor.
- **Simülasyon:** 500 eşzamanlı kullanıcı.
- **İşlem:** %100 `POST /api/v1/ducks` (Yeni Duck atma).
- **Beklenti:** Veritabanı yazma kuyruğunun şişmesi ve yanıt sürelerinin uzaması.

## 2. Takip Edilmesi Gereken Metrikler (KPIs)

| Metrik | Açıklama | Hedef Değer (MVP İçin) |
|--------|----------|------------------------|
| **Latency (Gecikme)** | Bir isteğin sunucuya gidip cevabın dönmesi süresi. | < 200ms (95. persentil) |
| **Throughput (İşlem Hacmi)** | Saniyede işlenen istek sayısı (RPS). | > 500 RPS |
| **Error Rate (Hata Oranı)** | Başarısız isteklerin toplam isteklere oranı. | < %1 |

## 3. Geliştirme Tavsiyeleri ve Riskler

### ⚠️ N+1 Sorgu Sorunu (En Kritik Risk)
**Nedir?** Bir liste çekerken (örneğin Feed), her bir öğe için ilişkili veriyi (örneğin Kullanıcı Profil Resmi) çekmek için veritabanına tekrar tekrar gitmek.
**Örnek:** 20 Duck listeledin. Her Duck için sahibini bulmak adına 20 tane daha SQL sorgusu atarsan toplam 21 sorgu olur.
**Çözüm:** SQLAlchemy'de `.options(joinedload(Duck.owner))` kullanarak "Eager Loading" yapmalısın. Tek sorguda hem Duck hem User verisini çekersin.

### 🔒 Güvenlik (JWT)
Token'ları asla LocalStorage'da saklama (XSS riski). `HttpOnly Cookie` kullanmak en güvenli yöntemdir.

### 🚀 Ölçeklenebilirlik
Başlangıçta her şeyi tek sunucuda tutabilirsin ama resim yüklemeleri (Media Upload) sunucu diskini çabuk doldurur.
**Tavsiye:** Resimleri AWS S3 veya MinIO gibi bir "Object Storage" servisine yükle ve veritabanında sadece URL'sini sakla.

Başarılar dilerim! 🦆
