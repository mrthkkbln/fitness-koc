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
3. Kurulum sihirbazını doldur (isteğe bağlı vücut fotoğrafı ve hedef silüet dahil) → plan oluşur.
4. **Ayarlar** sekmesi → kodu kameraya okut (aşağıda) → **Bağlantıyı test et** → "Bağlantı tamam ✓".

### Telefona bağlama (hiçbir şey yazmadan)
1. Bilgisayarda tabloyu yenile → üst menü **Fitness Koç → Telefona bağla**.
2. Telefonda uygulama → **Ayarlar → 📷 Kodu kameraya okut** → telefonu açılan pencereye tut. Adres ve kod birlikte okunur.

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
- Arkadaşlar aynı tabloya "Kullanıcı ekle" ile eklenir (aşağıda); e-postayla giriş yapılan gerçek hesap sistemi yok.

## Arkadaş ekleme
1. (Bir kez) Apps Script'te `Code.gs`'i yeni haliyle değiştir → Kaydet → **Dağıt → Dağıtımları yönet → ✏️ → Sürüm: Yeni sürüm → Dağıt**. Adres değişmez.
2. Arkadaşına uygulama linkini gönder. Safari'de açar → Paylaş → **Ana Ekrana Ekle** → kurulum sorularını cevaplar.
3. Arkadaşın kurulumun sonunda (ya da Ayarlar'da) **☁️ Verilerimi yedekle** → adını yazar → **İstek gönder**. Kod okutmak yok.
4. Senin uygulamanda Bugün ekranında "🔔 1 kişi onay bekliyor" çıkar → **Ayarlar → 👥 Kullanıcılar → Onayla**.
5. Arkadaşının uygulaması bir sonraki açılışta kendiliğinden bağlanır; o güne kadar girdiği kayıtlar tablondaki `Ad · Checkins`, `Ad · Sets`… sekmelerine akar.
- Her kullanıcının verisi ayrı sekmelerde ve ayrı anahtarla durur; birbirinin verisini göremez. Fotoğrafları Drive'da "Fitness Koç Fotoğraflar / Ad" klasörüne gider (vücut analizi fotoğrafları telefondan çıkmaz).
- Arkadaşının verisi senin Google Drive'ında durur; bunu bilerek kabul etmesi gerekir.
- Kullanıcıyı Ayarlar → 👥 Kullanıcılar → **Kaldır** ile çıkarabilirsin (sekmeleri silinmez). Sheets menüsündeki "Kullanıcı ekle / Kullanıcılar" (kare kodla) yöntemi de çalışır.
- Uygulamanın kodunda senin Apps Script adresin görünür; onay vermeden kimse veri okuyamaz/yazamaz, en fazla sana istek düşer.

## Program nasıl kişiselleşiyor
- **Kurulum sırası:** haftada kaç gün → hangi günler → saatler → aktiviteler → gün bazında neler yapılabilir → aynı gün olmayanlar → başlangıç bilgileri (cinsiyet dahil) → vücut fotoğrafı (isteğe bağlı) → şu anki ve hedef silüet → ortam → ağrı/sakatlık → öncelikli bölgeler → seans süresi → ölçüler → mevcut ağırlıklar.
- **Hedef:** Hedef silüetten otomatik çıkar (yağ yakımı / kas / ikisi) ve öncelikli bölgeler önerilir; istersen elle seçersin. Silüeti sonradan değiştirirsen plan kendiliğinden güncellenir.
- **Bölge bölge split:** 4+ ağırlık günü → Alt A / Üst A / Alt B / Üst B; 3 ve altı → Tüm vücut A/B/C. Her günün ana hareket iskeleti sabittir (squat, deadlift, bench, row, press, pulldown…).
- **Haftalık kas hacmi:** Her kasın haftalık set hedefi var. Büyük kaslarda: yeni 8, <1 yıl 10, 1–3 yıl 12, 3+ yıl 14 set. Yağ yakımında −2, kondisyonda −4; biceps/triceps −2, arka omuz/baldır/karın −4. Öncelikli bölge +4 (en fazla 22).
- **Yardımcı hareketler:** Ana hareketlerin her kasa verdiği iş hesaplanır (ör. bench: göğüs 1, triceps 0,5 set). Haftalık hedefin gerisinde kalan kaslara izolasyon eklenir. Öncelikli bölgeye her uygun günde en az bir doğrudan hareket konur. A ve B günlerinde farklı yardımcı hareketler seçilir.
- **Seans yapısı (spor bilimi):** Kas başına seansta en fazla ~10 set (yardımcı kasa giden set yarım sayılır; ~11 setten sonra ek kazanç fark edilmiyor) ve en fazla 2 hareket. Hareket başı 3 set (yeni başlayanda 2). Seans 6–8 hareket (yeni başlayanda en fazla 6). Süre: hareket başı ~8 dk (dinlenme dahil) + ısınma + soğuma; seans süresi ısınma/soğuma dahil üst sınır. Dinlenme: ana hareket 2–3 dk, yardımcı en az 90 sn.
- **4 haftalık bloklar:** Giriş (3 tekrar yedekte) → Birikim (2) → Birikim+ (2) → Zirve (1). Hacim %80 → %90 → %100 → %110. Toparlanma haftası sabit değil: haftalık değerlendirmede hareketlerin yarısı düşmüş ve çoğu "Zor" gelmişse o hafta toparlanma (set 2, ağırlık −%10), sonra yeni blok.
- **Bloklar arası tekrar periyotları:** Kas → Güç + kas → Yoğun/pump döngüsü (yağ yakımı ve kondisyonda: Kas → Yoğun → Güç + kas → Yoğun). Örnek, yağ yakımı + kas hedefinde: ana hareketler 8–12 → 6–10 → 10–15; yardımcılar 12–15 → 10–12 → 15–20. Blok değişince çalışma ağırlıkları yeni tekrar aralığına göre otomatik ayarlanır.
- **Hareket rotasyonu:** Yardımcı hareketler her blokta, ana hareketler 2 blokta bir değişir.
- **Ağırlık ve tekrar (otoregülasyon):** Ana hareketlerde "Son set nasıldı? Kolay / Tam / Zor" (varsayılan Tam). Her kayıttan sonra kilo × tekrar ve bu cevaptan tahmini güç hesaplanır; son 3 seansla karşılaştırılır (↑ / → / ↓). Sonraki ağırlık, hedef tekrarı haftanın hedef zorluğunda yapacağın şekilde seçilir (en fazla ±%10). Performans düşmüyorsa ağırlık düşürülmez, tekrar artar; üst sınırda ağırlık artar. Ana hareket 4, yardımcı 3 seans ilerlemezse otomatik değiştirilir. 10+ gün aradan sonra −%10.
- **Haftalık koç değerlendirmesi:** Her hafta başı: geçen haftanın gelişen/sabit/düşen hareketleri; kas başına hacim ±2 set (gelişiyor ve çok zor değilse artar, düşüyorsa azalır); gerekirse toparlanma haftası; yağ yakımı hedefinde kilo hızı kontrolü (haftada %0,5–1; zayıfsan ≤%0,5).
- **Deneyim / ortam / sakatlık:** Deneyim set sayısını ve hareket zorluğunu belirler. Ortam yalnızca ekipmana uygun hareketleri seçtirir. Ağrılı bölgeyi zorlayan hareketler yerine güvenli alternatif gelir, kaçınılmazsa ⚠ uyarısı çıkar.
- **Koşu / kardiyo ile aynı gün:** Planlayıcı bacak gününü zorlu sporla aynı güne ve bir gün öncesine koymamaya çalışır; üst vücut + koşu aynı gün olabilir. Aynı gün olursa: önce ağırlık, sonra koşu (mümkünse arada 6 saat), bacak hareketlerinde −1 set, bitişteki eğimli yürüyüş kalkar.
- **Planı önceden görme:** Bugün ekranında günün tüm hareketleri set × tekrar × kilo ile listelenir; Plan sekmesinde bu hafta ve gelecek haftanın her günü hareket hareket görünür. Harekete dokununca form videosu açılır.
- **Set sayısı:** Plan set sayısı önerir; kayıtta "+ Set ekle / − Son seti sil" ile yaptığın kadar set girebilirsin (en fazla 10).
- **Ağırlık nasıl yazılır:** Tek kolla sırayla yapılan hareketlerde (tek kol row, konsantrasyon curl, kablo yan açış…) tek kolun ağırlığı; dambıllı hareketlerde tek dambılın ağırlığı; barbell/makine/kabloda toplam ağırlık. Tek taraflı hareketlerde tekrar her taraf için. Kayıt ekranında her kutunun yanında yazar.
- **🔄 Muadil hareket:** Her hareketin yanındaki 🔄'ye her dokunuşta aynı kalıptan (aynı kasları çalıştıran) başka bir hareket gelir; sadece bugünlük. Set/tekrar yeni harekete göre ayarlanır; ağırlık o hareketin geçmişinden, yoksa aynı kalıptaki bildiğin hareketten tahmin edilir (barbell ↔ dambıl, aynı ekipman), tahmin edilemiyorsa "test" yazar.
- **Makine dolu:** Harekette "Değiştir" → aynı kalıptan alternatifler; **Bugün** sadece o günlük değiştirir (sonra plan eski haline döner), **Kalıcı** hep o hareketi koyar.
- **Plandan farklı antrenman:** Bugün → "Plandan farklı bir şey mi yaptın?" → başka gün / core / serbest seçim → set, tekrar, kilo gir. Kaydedince: planda olup yapılmayan ana hareketler (bugün o kası zaten çalıştırmadıysan) aynı bölgenin bir sonraki gününde o hareketlere +1 set olarak eklenir; bugün yoğun çalışan kaslar ertesi gün planda varsa o hareketlerde 1 set az verilir. Yaptığın hareketlerin ilerlemesi de kaydedilir (gerçek tekrar sayısına göre bir sonraki hedef).
- **Kaçan antrenman:** Dünkü kayıt yoksa "Yaptın mı?" diye sorulur; yapmadıysan bugünün planı spora başlamadan düzenlenir: ağırlık olmayan uygun bir güne alınır; yoksa aynı bölgenin bir sonraki gününde ana hareketlere +1 set (bacak hareketi üst vücut gününe eklenmez); hastalıkta hafifletme.
- **💬 Koça sor:** Sağ alttaki 💬 düğmesi. İnternet, bağlantı ve ücret gerektirmez; uygulamanın içindeki bilgiyle (planın, kayıtların, bilimsel kurallar) cevap verir: bugünün/yarının planı, bir hareketin ağırlığı ve nedeni, hareket neden değişti, ağrı (bölgeye göre öneri + ağrı listesine ekleme), ilerleme, toparlanma, kilo hızı, hacim, kaçan antrenman, makine dolu, dinlenme, koşu, ısınma, vücut analizi. Gerçek bir yapay zeka sohbeti değildir; kapsam dışı sorularda bilmediğini söyler. Yeni konular eklendikçe bilgisi büyür.
- Her harekette "Değiştir" ve "Bir daha önerme" var. Plandan farklı bir şey yaptıysan Bugün → "Plandan farklı bir şey mi yaptın?".

## Hareket videoları
151 hareketin her biri tek bir videoya bağlı. Kanal önceliği: Renaissance Periodization → Jeff Nippard → ATHLEAN-X → ScottHermanFitness; bunlarda yoksa başka popüler bir kanal. Değiştirmek için `index.html` içindeki `LIBRAW` listesinde ikinci alana YouTube video ID'sini yaz.
