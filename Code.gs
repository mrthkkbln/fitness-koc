/**
 * Fitness Koç – Google Apps Script backend
 * 1) Bu kodu Sheets > Uzantılar > Apps Script içine yapıştır.
 * 2) Üstten "kurulum" fonksiyonunu seçip ▶ Çalıştır. İzinleri onayla.
 * 3) Görüntüle > Günlükler (Execution log) içindeki TOKEN'ı kopyala.
 * 4) Dağıt > Yeni dağıtım > Web uygulaması: "Ben" olarak çalıştır, Erişim: "Herkes". URL'yi kopyala.
 * 5) Tabloyu yenile → üstte "Fitness Koç" menüsü → "Telefona bağla" → telefonda "Kodu kameraya okut".
 * Arkadaş eklemek: "Fitness Koç" → "Kullanıcı ekle" → isim yaz → çıkan kodu arkadaşın telefonuyla okutsun.
 *   Her kullanıcının verisi ayrı sekmelerde ("İsim · Checkins" gibi) ve ayrı anahtarla durur.
 */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Fitness Koç')
    .addItem('Telefona bağla', 'telefonaBagla')
    .addItem('Kullanıcı ekle', 'kullaniciEkle')
    .addItem('Kullanıcılar', 'kullanicilar')
    .addItem('Kurulum (ilk kez)', 'kurulum')
    .addToUi();
}

function telefonaBagla() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('TOKEN')) kurulum();
  qrGoster_(props.getProperty('TOKEN'), 'Telefona bağla');
}

function qrGoster_(token, title, note) {
  const props = PropertiesService.getScriptProperties();
  let url = '';
  try { url = ScriptApp.getService().getUrl() || ''; } catch (e) {}
  if (url && !/\/exec$/.test(url)) url = props.getProperty('WEBAPP_URL') || '';
  if (!url) url = props.getProperty('WEBAPP_URL') || '';
  const t = HtmlService.createTemplate(
    '<style>body{margin:0;font-family:Arial,sans-serif;text-align:center}#q img,#q canvas{margin:0 auto}</style>' +
    '<div id="q" style="padding:6px;background:#fff;display:flex;justify-content:center"></div>' +
    '<p style="font-size:13px;margin:6px 0">Telefonda: Ayarlar → <b>Kodu kameraya okut</b> → telefonu bu kareye tut.</p>' +
    '<input id="u" style="width:96%;padding:5px;font-size:11px" value="<?= url ?>" placeholder="/exec ile biten adresi buraya yapıştır">' +
    '<p style="font-size:11px;color:#b91c1c;margin:6px 0 0"><?= note ?></p>' +
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>' +
    '<script>var tok="<?= token ?>";function draw(){var u=document.getElementById("u").value.replace(/\\s+/g,"");var q=document.getElementById("q");q.innerHTML="";' +
    'if(/\\/exec$/.test(u)){new QRCode(q,{text:"FKOC|"+u+"|"+tok,width:240,height:240,correctLevel:QRCode.CorrectLevel.M});google.script.run.urlKaydet(u)}' +
    'else{q.innerHTML="<p style=\\"color:#b91c1c;font-size:13px;padding:40px 10px\\">Aşağıdaki kutuya /exec ile biten adresi yapıştır, kare kod burada çıkacak.</p>"}}' +
    'document.getElementById("u").addEventListener("input",draw);draw();</script>');
  t.url = url;
  t.token = token;
  t.note = note || 'Bu kod şifre gibidir, kimseyle paylaşma.';
  SpreadsheetApp.getUi().showModalDialog(t.evaluate().setWidth(320).setHeight(420), title);
}

/* ---------- çok kullanıcı ---------- */
function users_() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('USERS') || '{}'); } catch (e) { return {}; }
}
function saveUsers_(u) { PropertiesService.getScriptProperties().setProperty('USERS', JSON.stringify(u)); }

function kullaniciEkle() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('TOKEN')) kurulum();
  const r = ui.prompt('Kullanıcı ekle', 'Arkadaşının adı (sekmeler bu adla açılır):', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const name = String(r.getResponseText() || '').replace(/[^\wçğıöşüÇĞİÖŞÜ ]/g, '').trim().slice(0, 20);
  if (!name) { ui.alert('Geçerli bir ad yaz.'); return; }
  const u = users_();
  if (Object.keys(u).some(function (k) { return u[k].name.toLowerCase() === name.toLowerCase(); })) { ui.alert('Bu adla bir kullanıcı zaten var. Kodunu görmek için "Kullanıcılar"a gir.'); return; }
  const token = Utilities.getUuid().replace(/-/g, '');
  u[token] = { name: name, added: today_() };
  saveUsers_(u);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(function (s) { sheet_(ss, s, name + ' · '); });
  qrGoster_(token, name + ' için bağlantı kodu', name + ' telefonunda uygulamayı açıp Ayarlar → Kodu kameraya okut ile bu kareyi okutsun. Kod sadece ona özel.');
}

function kullanicilar() {
  const u = users_();
  const list = Object.keys(u).map(function (k) { return { t: k, n: u[k].name, d: u[k].added || '' }; });
  const t = HtmlService.createTemplate(
    '<style>body{font-family:Arial,sans-serif;font-size:14px}button{margin-left:6px}li{margin:8px 0}</style>' +
    '<p><b>Sen</b> (sahip): ana sekmeler.</p>' +
    '<? if (!list.length) { ?><p>Henüz başka kullanıcı yok. Menüden "Kullanıcı ekle".</p><? } ?>' +
    '<ul style="padding-left:18px"><? list.forEach(function(x){ ?><li><b><?= x.n ?></b> <span style="color:#666;font-size:12px"><?= x.d ?></span>' +
    '<button onclick="google.script.run.kullaniciQR(\'<?= x.t ?>\')">Kodu göster</button>' +
    '<button onclick="if(confirm(\'<?= x.n ?> kaldırılsın mı? Telefonu bağlantıyı kaybeder; sekmeleri silinmez.\'))google.script.run.withSuccessHandler(function(){google.script.host.close()}).kullaniciSil(\'<?= x.t ?>\')">Kaldır</button></li><? }) ?></ul>');
  t.list = list;
  SpreadsheetApp.getUi().showModalDialog(t.evaluate().setWidth(360).setHeight(320), 'Kullanıcılar');
}
function kullaniciQR(token) { const u = users_()[token]; if (u) qrGoster_(token, u.name + ' için bağlantı kodu', u.name + ' telefonunda Ayarlar → Kodu kameraya okut ile okutsun.'); }
function kullaniciSil(token) { const u = users_(); delete u[token]; saveUsers_(u); }

// token → kullanıcı (sahip: sekme öneki yok; diğerleri: "İsim · ")
function user_(token) {
  const props = PropertiesService.getScriptProperties();
  const own = props.getProperty('TOKEN');
  if (own && token === own) return { pre: '', folder: props.getProperty('FOLDER_ID') };
  const u = users_()[token];
  if (!u) return null;
  return { pre: u.name + ' · ', name: u.name, token: token, folder: u.folder || '' };
}

function urlKaydet(u) {
  if (/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(u)) PropertiesService.getScriptProperties().setProperty('WEBAPP_URL', u);
}

const SHEETS = {
  Checkins: ['zaman', 'tarih', 'aktivite', 'durum', 'sure_dk', 'mesafe_km', 'yogunluk', 'rpe', 'not'],
  Sets: ['zaman', 'tarih', 'antrenman', 'hareket', 'set', 'hedef_tekrar', 'tekrar', 'kg', 'plan_kg'],
  Body: ['zaman', 'tarih', 'kilo', 'yag_orani', 'bel', 'gogus', 'kol', 'kalca', 'kaynak'],
  Health: ['zaman', 'tarih', 'kilo', 'yag_orani', 'adim', 'aktif_kcal', 'dinlenme_nabiz', 'uyku_saat', 'antrenman_dk', 'kaynak'],
  Photos: ['zaman', 'tarih', 'aci', 'url', 'dosya_id'],
  State: ['zaman', 'json']
};

function kurulum() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(function (name) { sheet_(ss, name); });
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('TOKEN')) props.setProperty('TOKEN', Utilities.getUuid().replace(/-/g, ''));
  if (!props.getProperty('FOLDER_ID')) {
    const folder = DriveApp.createFolder('Fitness Koç Fotoğraflar');
    props.setProperty('FOLDER_ID', folder.getId());
  }
  Logger.log('TOKEN: ' + props.getProperty('TOKEN'));
}

function sheet_(ss, name, pre) {
  pre = pre || '';
  let sh = ss.getSheetByName(pre + name);
  if (!sh) {
    sh = ss.insertSheet(pre + name);
    sh.appendRow(SHEETS[name]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function folder_(U) {
  const props = PropertiesService.getScriptProperties();
  if (!U.pre) return DriveApp.getFolderById(props.getProperty('FOLDER_ID'));
  if (U.folder) { try { return DriveApp.getFolderById(U.folder); } catch (e) {} }
  const parent = DriveApp.getFolderById(props.getProperty('FOLDER_ID'));
  const f = parent.createFolder(U.name);
  const u = users_(); if (u[U.token]) { u[U.token].folder = f.getId(); saveUsers_(u); }
  return f;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function authOk_(token) { return !!(token && user_(token)); }

function today_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function rows_(sh, limit) {
  const last = sh.getLastRow();
  if (last < 2) return [];
  const start = Math.max(2, last - limit + 1);
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  return sh.getRange(start, 1, last - start + 1, head.length).getValues().map(function (r) {
    const o = {};
    head.forEach(function (h, i) {
      o[h] = r[i] instanceof Date ? Utilities.formatDate(r[i], Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss") : r[i];
    });
    return o;
  });
}

function doGet(e) {
  const p = e.parameter || {};
  const U = p.token ? user_(p.token) : null;
  if (!U) return json_({ ok: false, error: 'token' });
  const ss = SpreadsheetApp.getActiveSpreadsheet(), pre = U.pre;
  if (p.action === 'ping') return json_({ ok: true, user: U.name || '' });
  if (p.action === 'pull') {
    const st = rows_(sheet_(ss, 'State', pre), 1)[0];
    return json_({
      ok: true,
      health: rows_(sheet_(ss, 'Health', pre), 400),
      body: rows_(sheet_(ss, 'Body', pre), 400),
      photos: rows_(sheet_(ss, 'Photos', pre), 200),
      state: st ? st.json : null
    });
  }
  return json_({ ok: false, error: 'action' });
}

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'json' }); }
  const U = b.token ? user_(b.token) : null;
  if (!U) return json_({ ok: false, error: 'token' });
  const ss = SpreadsheetApp.getActiveSpreadsheet(), pre = U.pre;
  const now = new Date();
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (b.action === 'append') {
      if (!SHEETS[b.sheet]) return json_({ ok: false, error: 'sheet' });
      const sh = sheet_(ss, b.sheet, pre);
      (b.rows || []).forEach(function (r) { sh.appendRow([now].concat(r)); });
      return json_({ ok: true, n: (b.rows || []).length });
    }
    if (b.action === 'state') {
      const sh = sheet_(ss, 'State', pre);
      if (sh.getLastRow() > 1) sh.getRange(2, 1, 1, 2).setValues([[now, b.json]]);
      else sh.appendRow([now, b.json]);
      return json_({ ok: true });
    }
    if (b.action === 'photo') {
      const folder = folder_(U);
      const blob = Utilities.newBlob(Utilities.base64Decode(b.data), b.mime || 'image/jpeg', (b.date || today_()) + '_' + (b.angle || 'on') + '.jpg');
      const f = folder.createFile(blob);
      sheet_(ss, 'Photos', pre).appendRow([now, b.date || today_(), b.angle || '', f.getUrl(), f.getId()]);
      return json_({ ok: true, url: f.getUrl() });
    }
    if (b.action === 'health') {
      // iOS Kısayollar'dan gelir (Apple Health: Mi tartı, Apple Watch, Garmin, Oura vb.)
      const n = function (v) { const x = parseFloat(String(v === undefined ? '' : v).replace(',', '.')); return isNaN(x) ? '' : x; };
      let fat = n(b.fat);
      if (fat !== '' && fat <= 1) fat = Math.round(fat * 1000) / 10; // 0.21 -> 21
      sheet_(ss, 'Health', pre).appendRow([now, b.date || today_(), n(b.weight), fat, n(b.steps), n(b.kcal), n(b.rhr), n(b.sleep), n(b.workout_min), b.source || 'Kısayollar']);
      return json_({ ok: true });
    }
    return json_({ ok: false, error: 'action' });
  } finally {
    lock.releaseLock();
  }
}
