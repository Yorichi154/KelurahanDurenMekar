/* =====================================================================
   admin-enhance.js
   1) Feed dashboard: Berita (3 terbaru) + Agenda (akan datang saja),
      auto re-hydrate saat kembali ke dashboard (MutationObserver).
   2) Jam & tanggal realtime di top bar.
   3) Sembunyikan header publik saat berada di panel admin/staf/warga.
   4) Toast notifikasi saat aksi (tambah/ubah/hapus/upload) berhasil.
   5) Dropdown "Sisipkan Variabel" dibuat fixed agar tidak terpotong.
   ===================================================================== */
(function () {
  "use strict";

  var _origFetch = window.fetch ? window.fetch.bind(window) : null;

  /* ---------------- Helpers ---------------- */
  function el(id) { return document.getElementById(id); }
  function strip(s, fb) {
    var t = String(s == null ? "" : s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return t || (fb || "");
  }
  function clip(s, n) {
    var t = strip(s, "");
    return t.length > n ? t.slice(0, n).trim() + "\u2026" : t;
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function field(o, names, fb) {
    for (var i = 0; i < names.length; i++) {
      if (o && o[names[i]] != null && o[names[i]] !== "") return o[names[i]];
    }
    return fb;
  }
  function toArray(j) {
    if (Array.isArray(j)) return j;
    if (j && typeof j === "object") {
      var keys = ["data", "rows", "items", "result", "results", "berita", "agenda"];
      for (var i = 0; i < keys.length; i++) if (Array.isArray(j[keys[i]])) return j[keys[i]];
    }
    return [];
  }
  function fetchJson(url) {
    var f = _origFetch || window.fetch;
    return f(url, { credentials: "include", headers: { Accept: "application/json" }, cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(toArray)
      .catch(function () { return []; });
  }
  function dt(v) {
    var d = new Date(v || Date.now());
    return isNaN(d.getTime()) ? new Date() : d;
  }
  function fdate(v) {
    return dt(v).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
  function rel(v) {
    var d = dt(v), ms = new Date() - d, h = Math.floor(ms / 3600000);
    if (h < 1) return "Baru saja";
    if (h < 24) return h + " Jam yang lalu";
    var dy = Math.floor(h / 24);
    if (dy === 1) return "Kemarin";
    if (dy < 7) return dy + " Hari yang lalu";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }
  function dkey(o) { return String(field(o, ["date", "tanggal", "created_at", "createdAt"], "")).slice(0, 10); }

  /* Waktu relatif berdasarkan waktu upload NYATA (created_at), tanpa fallback "Baru saja" palsu */
  function relTime(v) {
    if (!v) return "";
    var d = new Date(v);
    if (isNaN(d.getTime())) return "";
    var ms = Date.now() - d.getTime();
    if (ms < 0) ms = 0;
    var min = Math.floor(ms / 60000);
    if (min < 1) return "Baru saja";
    if (min < 60) return min + " Menit yang lalu";
    var h = Math.floor(min / 60);
    if (h < 24) return h + " Jam yang lalu";
    var dy = Math.floor(h / 24);
    if (dy === 1) return "Kemarin";
    if (dy < 7) return dy + " Hari yang lalu";
    if (dy < 30) { var w = Math.floor(dy / 7); return w + " Minggu yang lalu"; }
    if (dy < 365) { var mo = Math.floor(dy / 30); return mo + " Bulan yang lalu"; }
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }
  function uploadTime(o) { return field(o, ["created_at", "createdAt", "date", "tanggal"], ""); }
  function withinDays(v, days) {
    if (!v) return false;
    var d = new Date(v);
    if (isNaN(d.getTime())) return false;
    var ms = Date.now() - d.getTime();
    return ms >= 0 && ms <= days * 86400000;
  }
  function countRecent(list, days) {
    var n = 0;
    for (var i = 0; i < list.length; i++) if (withinDays(uploadTime(list[i]), days)) n++;
    return n;
  }
  function isPengAktif(p) {
    var s = String(field(p, ["status"], "")).toLowerCase();
    if (!s) return true;
    return /(aktif|publish|tayang|active|terbit)/.test(s);
  }
  function setBadge(id, text) { var e = el(id); if (e) e.textContent = text; }
  function updateBadges(berita, agenda, galeri, peng) {
    var nb = countRecent(berita, 7);
    setBadge("badgeBerita", nb > 0 ? "+" + nb + " minggu ini" : "Belum ada minggu ini");
    var ng = countRecent(galeri, 7);
    setBadge("badgeGaleri", ng > 0 ? "+" + ng + " baru" : "Belum ada baru");
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var tk = today.toISOString().slice(0, 10);
    var up = agenda.filter(function (a) { var d = dkey(a); return d && d >= tk; }).length;
    setBadge("badgeAgenda", up > 0 ? up + " akan datang" : "Tidak ada agenda");
    var act = peng.filter(isPengAktif).length;
    setBadge("badgePengumuman", act > 0 ? act + " aktif" : "Tidak aktif");
  }

  /* ================= 1) DASHBOARD FEED ================= */
  var BERITA_URL = "/api/public/berita", AGENDA_URL = "/api/public/agenda", GALERI_URL = "/api/public/galeri", PENGUMUMAN_URL = "/api/public/pengumuman", feedBusy = false;

  function renderBerita(list) {
    var box = el("recentBerita");
    if (!box) return;
    var items = list.slice().sort(function (a, b) {
      return String(field(b, ["date", "created_at", "createdAt"], "")).localeCompare(String(field(a, ["date", "created_at", "createdAt"], "")));
    }).slice(0, 3);
    if (!items.length) { box.innerHTML = '<div class="dash-empty">Belum ada berita.</div>'; return; }
    box.innerHTML = items.map(function (b) {
      var cat = strip(field(b, ["category", "kategori"], "BERITA"), "BERITA").toUpperCase();
      var when = relTime(uploadTime(b));
      var title = strip(field(b, ["title", "judul"], "Tanpa Judul"), "Tanpa Judul");
      var exc = clip(field(b, ["excerpt", "ringkasan", "content", "isi"], ""), 70);
      var img = field(b, ["image", "gambar", "thumbnail"], "");
      var catClass = /sehat|kesehatan|vaksin/i.test(cat) ? "dash-news-cat cat-green" : "dash-news-cat";
      var thumb = img
        ? '<div class="dash-news-thumb" style="background-image:url(\'' + esc(img) + '\');background-size:cover;background-position:center"></div>'
        : '<div class="dash-news-thumb"><i class="fa-regular fa-image"></i></div>';
      return '<a class="dash-news-item nav-link" data-page="admin/berita" href="#admin/berita">' +
        thumb +
        '<div class="dash-news-body">' +
          '<div class="dash-news-meta"><span class="' + catClass + '">' + esc(cat) + '</span><span>&middot; ' + esc(when) + '</span></div>' +
          '<h4>' + esc(title) + '</h4>' + (exc ? '<p>' + esc(exc) + '</p>' : '') +
        '</div>' +
        '<span class="dash-news-go"><i class="fa-solid fa-chevron-right"></i></span>' +
      '</a>';
    }).join("");
  }

  function renderAgenda(list) {
    var card = document.querySelector(".dash-agenda-card");
    if (!card) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var todayKey = today.toISOString().slice(0, 10);
    var upcoming = list.filter(function (a) { var d = dkey(a); return d && d >= todayKey; })
      .sort(function (a, b) {
        var ad = dkey(a), bd = dkey(b);
        if (ad !== bd) return ad.localeCompare(bd);
        return String(field(a, ["time", "jam", "waktu"], "")).localeCompare(String(field(b, ["time", "jam", "waktu"], "")));
      });
    var head = '<div class="dash-agenda-head"><h3>Agenda Terdekat</h3><span class="dash-dot"></span></div>';
    if (!upcoming.length) {
      card.innerHTML = head +
        '<div class="dash-agenda-empty"><i class="fa-regular fa-calendar-xmark"></i><p>Belum ada agenda yang akan datang.</p></div>' +
        '<a class="dash-agenda-btn nav-link" data-page="admin/agenda" href="#admin/agenda">Kelola Agenda</a>';
      return;
    }
    var a = upcoming[0];
    var title = strip(field(a, ["title", "judul"], "Agenda Kelurahan"), "Agenda Kelurahan");
    var desc = clip(field(a, ["content", "isi", "keterangan", "description"], ""), 110);
    var date = fdate(field(a, ["date", "tanggal"], ""));
    var time = strip(field(a, ["time", "jam", "waktu"], ""), "");
    var loc = strip(field(a, ["location", "lokasi", "tempat"], ""), "");
    card.innerHTML = head +
      '<span class="dash-agenda-badge">AKAN DATANG</span>' +
      '<h2 class="dash-agenda-title">' + esc(title) + '</h2>' +
      '<p class="dash-agenda-desc">' + esc(desc || "Agenda kegiatan kelurahan.") + '</p>' +
      '<div class="dash-agenda-row"><span class="dash-agenda-ico"><i class="fa-regular fa-calendar"></i></span><div><span class="dash-agenda-k">TANGGAL</span><strong>' + esc(date) + '</strong></div></div>' +
      (time ? '<div class="dash-agenda-row"><span class="dash-agenda-ico"><i class="fa-regular fa-clock"></i></span><div><span class="dash-agenda-k">WAKTU</span><strong>' + esc(time) + ' WIB</strong></div></div>' : '') +
      (loc ? '<div class="dash-agenda-row"><span class="dash-agenda-ico"><i class="fa-solid fa-location-dot"></i></span><div><span class="dash-agenda-k">LOKASI</span><strong>' + esc(loc) + '</strong></div></div>' : '') +
      '<a class="dash-agenda-btn nav-link" data-page="admin/agenda" href="#admin/agenda">Lihat Detail Agenda</a>';
  }

  function needsFeed() {
    var box = el("recentBerita"), card = document.querySelector(".dash-agenda-card");
    if (!box && !card) return false;
    if (box && box.dataset.fed !== "1") return true;
    if (card && card.dataset.fed !== "1") return true;
    return false;
  }
  function hydrateFeed() {
    if (feedBusy || !needsFeed()) return;
    feedBusy = true;
    Promise.all([fetchJson(BERITA_URL), fetchJson(AGENDA_URL), fetchJson(GALERI_URL), fetchJson(PENGUMUMAN_URL)]).then(function (res) {
      var box = el("recentBerita");
      if (box) { renderBerita(res[0]); box.dataset.fed = "1"; }
      var card = document.querySelector(".dash-agenda-card");
      if (card) { renderAgenda(res[1]); card.dataset.fed = "1"; }
      updateBadges(res[0] || [], res[1] || [], res[2] || [], res[3] || []);
    }).catch(function () {}).then(function () { feedBusy = false; });
  }

  /* ================= 2) JAM REALTIME ================= */
  function tickClock() {
    var t = el("dashClockTime"), d = el("dashClockDate");
    if (!t && !d) return;
    var now = new Date();
    if (t) t.textContent = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    if (d) d.textContent = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  /* ================= 3) SEMBUNYIKAN HEADER DI PANEL ================= */
  function syncHeader() {
    /* Sembunyikan header HANYA jika sedang berada di dalam panel (ada layout
       admin/staf/warga di DOM). Di halaman publik (meski sudah login) tidak ada
       panel ini, sehingga header tetap tampil agar bisa mengakses fitur lain. */
    var inPanel = !!document.querySelector(
      ".admin-main, .staf-main, .warga-main, .admin-side, .staf-side, .warga-side, .admin-shell, .staf-shell, .warga-shell"
    );
    document.body.classList.toggle("dash-hide-header", inPanel);
  }

  /* ================= 4) TOAST NOTIFIKASI ================= */
  function toastHost() {
    var host = el("dashToastHost");
    if (!host) {
      host = document.createElement("div");
      host.id = "dashToastHost";
      host.className = "dash-toast-host";
      document.body.appendChild(host);
    }
    return host;
  }
  function showToast(msg, type) {
    if (!msg) return;
    var host = toastHost();
    var t = document.createElement("div");
    t.className = "dash-toast " + (type === "error" ? "error" : "success");
    var ic = document.createElement("i");
    ic.className = "fa-solid " + (type === "error" ? "fa-circle-exclamation" : "fa-circle-check");
    var sp = document.createElement("span");
    sp.textContent = msg;
    t.appendChild(ic); t.appendChild(sp);
    host.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () { t.classList.remove("show"); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320); }, 3600);
  }
  window.dashToast = showToast;

  var RES = {
    berita: "Berita", agenda: "Agenda", galeri: "Foto galeri", pengumuman: "Pengumuman",
    users: "Pengguna", lembaga: "Lembaga", "unit-kerja": "Unit kerja", faq: "FAQ",
    surat: "Surat", pengaduan: "Pengaduan", pelayanan: "Layanan surat",
    profil: "Profil kelurahan", struktur: "Struktur organisasi"
  };
  function msgFor(url, method) {
    var m = String(url).toLowerCase().match(/\/api\/(?:admin\/|staf\/|warga\/|public\/)?([a-z-]+)/);
    if (!m) return null;
    var key = m[1];
    if (/^(login|logout|register|auth|me|session|stats|user|token|refresh|csrf)$/.test(key)) return null;
    var label = RES[key];
    if (!label) return null;
    if (method === "DELETE") return label + " berhasil dihapus.";
    if (method === "PUT" || method === "PATCH") return label + " berhasil diperbarui.";
    if (method === "POST") {
      if (key === "galeri") return "Foto berhasil diunggah ke galeri.";
      if (key === "surat") return "Surat berhasil dibuat.";
      if (key === "pengaduan") return "Pengaduan berhasil dikirim.";
      return label + " berhasil ditambahkan.";
    }
    return null;
  }
  if (_origFetch) {
    window.fetch = function (input, init) {
      var url = (typeof input === "string" ? input : (input && input.url)) || "";
      var method = ((init && init.method) || (typeof input !== "string" && input && input.method) || "GET").toUpperCase();
      var p = _origFetch(input, init);
      if (method !== "GET" && /\/api\//i.test(url)) {
        p.then(function (res) {
          try { if (res && res.ok) showToast(msgFor(url, method), "success"); } catch (e) {}
          return res;
        }, function () {});
      }
      return p;
    };
  }

  /* ================= 5) WORD EDITOR: dropdown variabel un-clip ================= */
  function varMenuOpen(menu) {
    if (!menu) return false;
    var d = menu.style.display;
    if (d === "none") return false;
    if (d) return true;
    return getComputedStyle(menu).display !== "none";
  }
  function positionVarMenu() {
    var btn = el("btnInsertVar"), menu = el("varDropdownMenu");
    if (!btn || !menu || !varMenuOpen(menu)) return;
    var r = btn.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.top = (r.bottom + 6) + "px";
    menu.style.left = r.left + "px";
    menu.style.right = "auto";
    menu.style.maxHeight = "360px";
    menu.style.overflowY = "auto";
    menu.style.zIndex = "3000";
    var mw = menu.offsetWidth || 260;
    if (r.left + mw > window.innerWidth - 8) {
      menu.style.left = Math.max(8, window.innerWidth - mw - 8) + "px";
    }
  }

  /* ================= ORCHESTRATION ================= */
  function runAll() {
    syncHeader();
    hydrateFeed();
    tickClock();
  }
  function schedule() {
    [0, 80, 250, 600, 1200].forEach(function (ms) { setTimeout(runAll, ms); });
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("#btnInsertVar")) {
      setTimeout(positionVarMenu, 0);
      setTimeout(positionVarMenu, 40);
    }
  }, true);
  window.addEventListener("resize", function () { setTimeout(positionVarMenu, 0); });
  window.addEventListener("scroll", function (e) {
    var menu = el("varDropdownMenu");
    if (menu && e.target && menu.contains && menu.contains(e.target)) return;
    positionVarMenu();
  }, true);

  document.addEventListener("DOMContentLoaded", function () { schedule(); setInterval(tickClock, 1000); });
  document.addEventListener("page:loaded", schedule);
  window.addEventListener("hashchange", schedule);
  window.addEventListener("load", schedule);

  /* Auto re-hydrate feed + sinkron header saat konten SPA berubah */
  function startObserver() {
    var target = el("content") || document.body;
    if (!target || target.__dashObserved) return;
    target.__dashObserved = true;
    var mo = new MutationObserver(function () {
      syncHeader();
      if (needsFeed()) hydrateFeed();
    });
    mo.observe(target, { childList: true, subtree: true });
  }
  if (document.readyState !== "loading") startObserver();
  document.addEventListener("DOMContentLoaded", startObserver);
})();
