/**
 * Fitness Koç – Google Apps Script backend
 * 1) Bu kodu Sheets > Uzantılar > Apps Script içine yapıştır.
 * 2) Üstten "kurulum" fonksiyonunu seçip ▶ Çalıştır. İzinleri onayla.
 * 3) Görüntüle > Günlükler (Execution log) içindeki TOKEN'ı kopyala.
 * 4) Dağıt > Yeni dağıtım > Web uygulaması: "Ben" olarak çalıştır, Erişim: "Herkes". URL'yi kopyala.
 * 5) Tabloyu yenile → üstte "Fitness Koç" menüsü → "Telefona bağla" → telefonda "Kodu kameraya okut".
 */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Fitness Koç')
    .addItem('Telefona bağla', 'telefonaBagla')
    .addItem('Kurulum (ilk kez)', 'kurulum')
    .addToUi();
}

function telefonaBagla() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('TOKEN')) kurulum();
  let url = '';
  try { url = ScriptApp.getService().getUrl() || ''; } catch (e) {}
  if (url && !/\/exec$/.test(url)) url = props.getProperty('WEBAPP_URL') || '';
  if (!url) url = props.getProperty('WEBAPP_URL') || '';
  const t = HtmlService.createTemplate(
    '<div style="font-family:Arial,sans-serif;text-align:center">' +
    '<p style="font-size:14px;margin:4px 0 10px">Telefonda: Fitness Koç → Ayarlar → <b>Kodu kameraya okut</b>, sonra telefonu bu koda tut.</p>' +
    '<div style="font-family:Menlo,Consolas,monospace;font-size:22px;letter-spacing:1px;background:#fff;border:2px solid #222;border-radius:8px;padding:18px 8px;word-break:break-all"><?= token ?></div>' +
    '<p style="font-size:12px;margin:16px 0 4px">Web uygulaması URL (Panodan yapıştır için kopyala):</p>' +
    '<textarea readonly style="width:100%;height:54px;font-size:11px" onclick="this.select()"><?= url ?></textarea>' +
    '<p style="font-size:11px;color:#666;margin:4px 0">Mac\'te kopyala → iPhone\'da Ayarlar → Panodan yapıştır (aynı Apple hesabı).</p>' +
    '<p style="font-size:11px;color:#b91c1c">Bu kod şifre gibidir, kimseyle paylaşma.</p></div>');
  t.url = url;
  t.token = props.getProperty('TOKEN');
  SpreadsheetApp.getUi().showModalDialog(t.evaluate().setWidth(380).setHeight(420), 'Telefona bağla');
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

function sheet_(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(SHEETS[name]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function authOk_(token) {
  const t = PropertiesService.getScriptProperties().getProperty('TOKEN');
  return t && token === t;
}

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
  if (!authOk_(p.token)) return json_({ ok: false, error: 'token' });
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (p.action === 'ping') return json_({ ok: true });
  if (p.action === 'pull') {
    const st = rows_(sheet_(ss, 'State'), 1)[0];
    return json_({
      ok: true,
      health: rows_(sheet_(ss, 'Health'), 400),
      body: rows_(sheet_(ss, 'Body'), 400),
      photos: rows_(sheet_(ss, 'Photos'), 200),
      state: st ? st.json : null
    });
  }
  return json_({ ok: false, error: 'action' });
}

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'json' }); }
  if (!authOk_(b.token)) return json_({ ok: false, error: 'token' });
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const now = new Date();
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (b.action === 'append') {
      const sh = sheet_(ss, b.sheet);
      (b.rows || []).forEach(function (r) { sh.appendRow([now].concat(r)); });
      return json_({ ok: true, n: (b.rows || []).length });
    }
    if (b.action === 'state') {
      const sh = sheet_(ss, 'State');
      if (sh.getLastRow() > 1) sh.getRange(2, 1, 1, 2).setValues([[now, b.json]]);
      else sh.appendRow([now, b.json]);
      return json_({ ok: true });
    }
    if (b.action === 'photo') {
      const folder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('FOLDER_ID'));
      const blob = Utilities.newBlob(Utilities.base64Decode(b.data), b.mime || 'image/jpeg', (b.date || today_()) + '_' + (b.angle || 'on') + '.jpg');
      const f = folder.createFile(blob);
      sheet_(ss, 'Photos').appendRow([now, b.date || today_(), b.angle || '', f.getUrl(), f.getId()]);
      return json_({ ok: true, url: f.getUrl() });
    }
    if (b.action === 'health') {
      // iOS Kısayollar'dan gelir (Apple Health: Mi tartı, Apple Watch, Garmin, Oura vb.)
      const n = function (v) { const x = parseFloat(String(v === undefined ? '' : v).replace(',', '.')); return isNaN(x) ? '' : x; };
      let fat = n(b.fat);
      if (fat !== '' && fat <= 1) fat = Math.round(fat * 1000) / 10; // 0.21 -> 21
      sheet_(ss, 'Health').appendRow([now, b.date || today_(), n(b.weight), fat, n(b.steps), n(b.kcal), n(b.rhr), n(b.sleep), n(b.workout_min), b.source || 'Kısayollar']);
      return json_({ ok: true });
    }
    return json_({ ok: false, error: 'action' });
  } finally {
    lock.releaseLock();
  }
}
