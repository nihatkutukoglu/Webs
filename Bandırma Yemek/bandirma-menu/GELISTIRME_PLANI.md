# 🚀 Bandırma Yemek & Gezi Rehberi - Geliştirme Planı

Bu belge, **Bizim Bandırma** projesini daha modern, kullanıcı dostu ve ölçeklenebilir hale getirmek için yapılması gereken geliştirmeleri **Paketler** halinde sunar.

## 📦 Paket 1: Görsel Revizyon ve Marka Kimliği (Öncelikli)

_Siteye ilk girişte "Vay canına" dedirtecek görsel iyileştirmeler._

- [ ] **Modern Font Ailesine Geçiş**:
  - Şu an kullanılan `Inter` fontu çok standart. Başlıklar için **"Outfit"** veya **"Poppins"**, metinler için **"Inter"** veya **"DM Sans"** kombinasyonu kullanılmalı.
- [ ] **Renk Paleti Özelleştirme**:
  - Standart Tailwind renkleri yerine, Bandırma'nın denizini ve güneşini yansıtan özel bir renk paleti (`tailwind.config.js` içinde `brand-blue`, `brand-orange` gibi) tanımlanmalı.
- [ ] **Skeleton Loading (İskelet Yükleme)**:
  - Veriler yüklenirken sadece dönen bir çember yerine, içeriğin silüetinin göründüğü modern "Skeleton" yükleme ekranları yapılmalı.
- [ ] **Glassmorphism Etkileri**:
  - Menü, Header ve Modallarda buzlu cam (backdrop-blur) efektleri artırılarak daha premium bir his sağlanmalı.
- [ ] **Mikro-Animasyonlar**:
  - Butonlara basıldığında, sayfa geçişlerinde ve favorilere eklerken `framer-motion` ile yumuşak animasyonlar eklenmeli.

## 📦 Paket 2: Kullanıcı Deneyimi (UX) ve Özellikler

_Kullanıcının sitede daha rahat dolaşmasını ve aradığını bulmasını sağlayacak özellikler._

- [ ] **Gömülü Harita Görünümü**:
  - Sadece Google Maps'e link vermek yerine, tüm mekanların harita üzerinde pinler (iğneler) olarak göründüğü interaktif bir harita sayfası.
- [ ] **Gelişmiş Filtreleme ve Sıralama**:
  - "En Yüksek Puanlılar", "Şu An Açık Olanlar", "Deniz Manzaralı" gibi gelişmiş filtre seçenekleri.
- [ ] **Karanlık Mod (Dark Mode)**:
  - Gece kullanımları için göz yormayan, sistem temasına duyarlı otomatik Karanlık Mod desteği.
- [ ] **Sonsuz Kaydırma (Infinite Scroll)**:
  - Tüm mekanları tek seferde çekmek yerine, kullanıcı aşağı indikçe yeni mekanların yüklenmesi.

## 📦 Paket 3: Topluluk ve Etkileşim

_Kullanıcıları siteye bağlayacak sosyal özellikler._

- [ ] **Gelişmiş Kullanıcı Profili**:
  - Kullanıcıların kendi profillerini düzenleyebilmesi, profil fotoğrafı ekleyebilmesi.
- [ ] **Fotoğraflı Yorum Sistemi**:
  - Kullanıcıların yorum yaparken mekana ait kendi çektikleri fotoğrafları da yükleyebilmesi.
- [ ] **Rozet Sistemi**:
  - Çok gezen veya çok yorum yapan kullanıcılara "Bandırma Gurmesi", "Gezgin" gibi rütbeler/rozetler verilmesi.

## 📦 Paket 4: Teknik Altyapı, Güvenlik ve Mimari (Kritik)

_Uygulamanın "Canlıda Patlamaması" ve güvenli bir şekilde büyümesi için gerekli olan teknik temel._

### 🛠 1. Veritabanı ve Güvenlik Mimarisi (Firebase Yeterli mi?)

**Durum:** Evet, Firebase bu proje için **fazlasıyla yeterli ve uygundur.**

- **Neden:** Klasik sunucu (backend) masrafı yoktur, anlık on binlerce kullanıcıyı kaldırabilir.
- **Risk:** Şu an geliştirme modunda olduğumuz için veritabanı herkese açık olabilir. Kötü niyetli biri verileri silebilir.
- **Çözüm:**
  - [ ] **Firestore Güvenlik Kuralları (Security Rules)**: Veritabanına kimin yazabileceğini ("Admin" olanlar) ve kimin okuyabileceğini ("Herkes") kod tarafında değil, Firebase panelinde kurallarla kilitleyeceğiz.
  - [ ] **Validasyon**: "Yorum" alanına biri roman yazmasın diye karakter sınırı kuralları eklenecek.

### 🚀 2. Performans ve Kota Kontrolü

**Risk:** Firebase okuma başına ücretlendirir/kota koyar. Sitede 1000 mekan varsa ve her giren 1000'ini aynı anda çekerse kota anında dolar.

- **Çözüm:**
  - [ ] **Sayfalama (Pagination)**: Kullanıcı aşağı indikçe 20'şer 20'şer mekan yükleyeceğiz.
  - [ ] **Önbellekleme (Caching)**: Kullanıcı sayfayı yenilediğinde veriyi tekrar sunucudan çekmek yerine, 1 saat boyunca tarayıcı hafızasından (LocalStorage/SessionStorage) okutacağız.

### 🛡️ 3. Hata Yönetimi (Error Boundaries)

**Risk:** Bir bileşen (örneğin Resim yükleme) hata verirse, React uygulaması komple beyaz ekran verebilir (çökebilir).

- **Çözüm:**
  - [ ] **Error Boundary**: "Hata Sınırı" bileşenleri ekleyerek, bir yer bozulsa bile sitenin geri kalanının çalışmaya devam etmesini sağlayacağız. "Bir hata oluştu, lütfen sayfayı yenileyin" gibi şık uyarılar göstereceğiz.

### 🏢 4. Canlı Ortam (Production) Hazırlığı

- [ ] **Ortam Değişkenleri (.env)**: API anahtarlarını kodun içinden çıkarıp `.env` dosyasına taşıyacağız.
- [ ] **Lighthouse Testleri**: Google'ın hız testinden geçip puanımızı 90+'a çıkaracağız.
- [ ] **Build Optimizasyonu**: `npm run build` komutu ile gereksiz kodları temizleyip dosya boyutunu küçülteceğiz.

## 🧠 Analiz: Firebase Sizi Yarı Yolda Bırakır mı?

**Hayır, bırakmaz.**

- **Ölçeklenebilirlik:** Getir, Udemy gibi devlerin kullandığı altyapıların benzeridir (Serverless). Trafik artınca sunucu çökmez, sadece fatura (belirli bir kotadan sonra) devreye girer. Başlangıçta ücretsiz "Spark" paketi çok uzun süre yeterlidir.
- **Mimari:** Sizin şu an yaptığınız mimari **"Frontend-Heavy Serverless"** olarak geçer. Modern web'in gittiği yön budur. Backend yazmak yerine backend hizmeti (BaaS) kullanıyorsunuz.

**Sonuç:** Mimari doğrudur, sadece "Emniyet Kemerlerini" (Güvenlik Kuralları ve Hata Yakalama) takmamız gerekiyor. Bu Paket 4'ü uyguladığımızda gönül rahatlığıyla canlıya çıkabilirsiniz.

## 📅 Güncellenmiş Yol Haritası

1.  **Paket 1 (Görsel)**: Vitrini düzelt.
2.  **Paket 4 (Teknik Güvenlik)**: **ÖNCELİKLİ**. Siteyi canlıya almadan önce güvenlik kurallarını ve hata yakalayıcıları ekle.
3.  **Paket 2 & 3**: Özellik eklemeye devam et.
