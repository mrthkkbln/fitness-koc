# Fitness Koç v1 – Kurulum

Toplam ~30 dk. Sırayla yap.

## 1. Google Sheets + Apps Script (veri deposu)
1. sheets.new → yeni tablo aç, adı: **Fitness Koç**.
2. Uzantılar → **Apps Script**. Açılan editördeki her şeyi sil, `Code.gs` içeriğini yapıştır, kaydet.
3. Üstteki fonksiyon listesinden **kurulum** seç → ▶ Çalıştır → izinleri onayla ("Gelişmiş → güvenli değil'e git" çıkarsa: kendi kodun, devam).
4. Alttaki **Yürütme günlüğü**'nde `TOKEN: ...` satırını kopyala. Tabloya sekmeler ve Drive'da "Fitness Koç Fotoğraflar" klasörü oluşur.
5. **Dağıt → Yeni dağıtım** → tür: **Web uygulaması** → Yürüten: **Ben** → Erişim: **Herkes** → Dağıt. **Web uygulaması URL**'sini kopyala (`.../exec` ile biter).
   - Erişim "Herkes" olsa da TOKEN olmadan hiçbir veri okunamaz/yazılamaz.
   - Kodu sonra değiştirirsen: Dağıt → Dağıtımları yönet → ✏️ → Sürüm: Yeni sürüm.

## 2. GitHub Pages (uygulamanın adresi)
1. github.com → **Sign up** → hesap aç (ücretsiz).
2. Sağ üst **+ → New repository** → ad: `fitness-koc` → **Public** → Create.
3. **uploading an existing file** linki → zip içindeki dosyaların hepsini sürükle: `index.html`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` → **Commit changes**.
   (`Code.gs` ve bu dosyayı yüklemene gerek yok.)
4. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch: **main** / **(root)** → Save.
5. 1–2 dk sonra adres: `https://KULLANICI-ADIN.github.io/fitness-koc/`

## 3. iPhone'a kur
1. Adresi **Safari**'de aç → Paylaş → **Ana Ekrana Ekle**.
2. Uygulamayı ana ekrandaki ikondan aç (bundan sonra hep oradan aç; Safari'deki kopya ayrı veri tutar).
3. Kurulum sihirbazını doldur → plan oluşur → başlangıç fotoğraflarını çek.
4. **Ayarlar** sekmesi → URL ve TOKEN'ı yapıştır → **Bağlantıyı test et** → "Bağlantı tamam ✓".

## 4. Mi tartı → Apple Health
Zepp Life (Mi Fit) → Profil → **Apple Health** (Üçüncü taraf erişimi) → bağla, kilo ve vücut yağını yazmaya izin ver.
Tartıldıktan sonra Zepp Life'ı bir kez açman veri aktarımını tetikler.

## 5. Apple Health → Sheets kısayolu (Apple Watch, Mi tartı, Garmin, Oura…)
Kısayollar → **+** → ad: **Fitness Sağlık Gönder**. Eylemleri sırayla ekle:

| # | Eylem | Ayar | Değişken adı |
|---|---|---|---|
| 1 | Sağlık Örneklerini Bul | Tür: **Ağırlık** · Sırala: Başlangıç Tarihi, En Yeni Önce · Sınır: 1 | Kilo |
| 2 | Sağlık Örneklerini Bul | Tür: **Vücut Yağ Yüzdesi** · aynı sıralama · Sınır: 1 | Yag |
| 3 | Sağlık Örneklerini Bul | Tür: **Adımlar** · Başlangıç Tarihi: Bugün | – |
| 4 | İstatistikleri Hesapla | **Toplam** | Adim |
| 5 | Sağlık Örneklerini Bul | Tür: **Aktif Enerji** · Başlangıç Tarihi: Bugün | – |
| 6 | İstatistikleri Hesapla | **Toplam** | Kcal |
| 7 | Sağlık Örneklerini Bul | Tür: **Dinlenme Kalp Atış Hızı** · En Yeni · Sınır: 1 | Nabiz |
| 8 | URL'nin İçeriğini Al | URL: Apps Script URL'n · Yöntem: **POST** · İstek Gövdesi: **JSON** | – |

8. adımdaki JSON alanları (hepsi Metin):
`token` = TOKEN'ın · `action` = `health` · `weight` = Kilo · `fat` = Yag · `steps` = Adim · `kcal` = Kcal · `rhr` = Nabiz · `source` = `Apple Health`

Test: kısayolu çalıştır → Sheets'te **Health** sekmesine satır düşmeli. Uygulamada Bugün → **Yenile**.
(Eylem adları iOS sürümüne göre biraz farklı olabilir. Değerler "88 kg" gibi birimli gelse de sunucu sayıyı ayıklar.)

## 6. Otomasyonlar (Kısayollar → Otomasyon → + → Kişisel)
- **Günün Saati 09:00, her gün** → Fitness Sağlık Gönder'i çalıştır → **Hemen Çalıştır**.
- **Günün Saati 21:30, Pzt–Cum** ve **13:00, Cmt–Paz** → Bildirim Göster: "Check-in zamanı – Fitness Koç'u aç".
- **Apple Watch Antrenmanı → Bittiğinde** (menüde varsa) → Fitness Sağlık Gönder + Bildirim Göster: "Antrenman bitti, check-in yap".
- Not: iOS, ana ekrana eklenmiş web uygulamasını bir linkle açamıyor; bildirime gelince ikondan aç.

## 7. Bilinen sınırlar (v1)
- Saatin üstünde ayrı bir uygulama yok (bunun için watchOS uygulaması gerekir); Watch verisi Apple Health üzerinden gelir.
- Android: Health Connect web'den okunamıyor; ileride küçük bir Android uygulaması ya da Strava/Garmin/Oura API'si ile eklenecek.
- Her kullanıcı kendi Sheets kopyasını kurar (çok kullanıcılı sunucu sonraki aşama).

## Hareket videoları
Her hareket tek bir videoya bağlı (çoğu Jeff Nippard teknik serisi; Bulgarian split squat: Squat University; hip thrust: Bret Contreras). Değiştirmek istersen `index.html` içindeki `EX` listesindeki `v:` alanına YouTube video ID'sini yaz.
