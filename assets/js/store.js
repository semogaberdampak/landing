/* Portal KiTA — store.js
   Sumber kebenangan data: localStorage (key portal-kita:data:v1).
   Berfungsi offline; tanpa dependensi.
*/
(function (global) {
  "use strict";

  const KEY = "portal-kita:data:v1";
  const CHANGE_EVENT = "portal:change";

  let HAS_STORAGE = true;
  try {
    const testKey = "__portal_kita_test__";
    global.localStorage.setItem(testKey, "1");
    global.localStorage.removeItem(testKey);
  } catch (err) {
    HAS_STORAGE = false;
  }

  const DEFAULT_LINKS = [
    { id: "ln1", title: "Ruang Belajar", tag: "Belajar", url: "https://portalkita.id/belajar", desc: "Kelas, modul, dan catatan bareng.", icon: "book", accent: "sun", featured: true },
    { id: "ln2", title: "Panggung Karya", tag: "Panggung", url: "https://portalkita.id/panggung", desc: "Pameran karya dan pertunjukan.", icon: "spark", accent: "plum", featured: false },
    { id: "ln3", title: "Ruang Diskusi", tag: "Diskusi", url: "https://portalkita.id/diskusi", desc: "Forum tanya jawab dan curhat.", icon: "chat", accent: "mint", featured: false },
    { id: "ln4", title: "Kalender Acara", tag: "Agenda", url: "https://portalkita.id/agenda", desc: "Jadwal kegiatan komunitas.", icon: "calendar", accent: "sun", featured: false },
    { id: "ln5", title: "Bank Sumber", tag: "Sumber", url: "https://portalkita.id/sumber", desc: "Kumpulan tautan berguna.", icon: "link", accent: "plum", featured: false },
    { id: "ln6", title: "Tim Kurator", tag: "Tim", url: "https://portalkita.id/tim", desc: "Kenali orang di balik portal.", icon: "users", accent: "mint", featured: false },
    { id: "ln7", title: "Dokumentasi", tag: "Dok", url: "https://portalkita.id/dok", desc: "Cara pakai dan kontribusi.", icon: "pen", accent: "sun", featured: false },
    { id: "ln8", title: "Galeri", tag: "Galeri", url: "https://portalkita.id/galeri", desc: "Foto dan video kegiatan.", icon: "spark", accent: "plum", featured: false },
    { id: "ln9", title: "Hubungi Kami", tag: "Kontak", url: "mailto:halo@portalkita.id", desc: "Sapa, kirim ide, atau kolaborasi.", icon: "chat", accent: "mint", featured: false }
  ];

  const DEFAULT_STATS = [
    { id: "st1", value: "9", label: "Ruang terhubung", note: "dalam satu pintu" },
    { id: "st2", value: "340+", label: "Anak muda", note: "dari 6 kota" },
    { id: "st3", value: "12", label: "Kegiatan", note: "per bulan" }
  ];

  const DEFAULT_NOTES = [
    { id: "nt1", title: "Pendaftaran kelas baru dibuka", tag: "Agenda", date: "2026-11-15", body: "Kelas menulis dan desain grafis dibuka untuk angkatan berikutnya." },
    { id: "nt2", title: "Panggung Karya bulan ini", tag: "Panggung", date: "2026-11-22", body: "Pameran karya anak muda dari berbagai kota." },
    { id: "nt3", title: "Rapat kurator", tag: "Info", date: "2026-11-08", body: "Tim kurator meninjau usulan portal baru tiap minggu." }
  ];

  const DEFAULT_POINTS = [
    { title: "Dikurasi komunitas", text: "Setiap ruang dicek agar relevan, aman, dan berguna." },
    { title: "Ringan & cepat", text: "Tanpa build step, bisa dibuka bahkan di sinyal lemah." },
    { title: "Bisa offline", text: "Setelah sekali dibuka, halaman tetap bisa diakses tanpa jaringan." }
  ];

  const DEFAULTS = {
    links: DEFAULT_LINKS,
    stats: DEFAULT_STATS,
    notes: DEFAULT_NOTES,
    site: {
      brand: "Portal KiTA",
      badge: "Ruang kolaborasi anak muda",
      heroTitle: "Portal KiTA",
      heroHighlight: "KiTA",
      heroLead: "Satu pintu, banyak ruang buat berkarya.",
      heroText: "",
      ctaPrimary: "Jelajahi Portal",
      ctaSecondary: "Baca Kabar",
      statusText: "Portal lagi aktif",
      aboutTitle: "Bukan cuma daftar tautan.",
      aboutText: "",
      aboutPoints: DEFAULT_POINTS,
      marquee: ["Kolaborasi", "Karya", "Belajar"],
      contactLabel: "Sapa Kami",
      contactUrl: "mailto:halo@portalkita.id",
      footerNote: "Dibangun bareng, untuk kita semua.",
      installHint: "Pasang Portal KiTA di layar utama — ringan, cepat, bisa dibuka tanpa sinyal."
    },
    meta: { updatedAt: null },
    submissions: []
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function uid(prefix) {
    prefix = prefix || "id";
    return prefix + Math.random().toString(36).slice(2, 9);
  }

  function ensureId(item, prefix) {
    if (!item || typeof item !== "object") return item;
    if (!item.id) item.id = uid(prefix);
    return item;
  }

  function normalize(raw) {
    const base = clone(DEFAULTS);
    if (!raw || typeof raw !== "object") return base;
    const out = clone(base);
    if (Array.isArray(raw.links)) out.links = raw.links.map(function (l) { return ensureId(clone(l), "ln"); });
    if (Array.isArray(raw.stats)) out.stats = raw.stats.map(function (s) { return ensureId(clone(s), "st"); });
    if (Array.isArray(raw.notes)) out.notes = raw.notes.map(function (n) { return ensureId(clone(n), "nt"); });
    if (raw.site && typeof raw.site === "object") {
      Object.keys(raw.site).forEach(function (k) {
        if (k === "marquee") {
          const v = raw.site.marquee;
          out.site.marquee = Array.isArray(v)
            ? v.map(function (x) { return String(x).trim(); }).filter(Boolean)
            : String(v || "").split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean);
        } else if (k === "aboutPoints") {
          out.site.aboutPoints = Array.isArray(raw.site.aboutPoints) ? raw.site.aboutPoints.map(function (p) { return clone(p); }) : out.site.aboutPoints;
        } else {
          out.site[k] = raw.site[k];
        }
      });
    }
    if (raw.meta && typeof raw.meta === "object") {
      out.meta = Object.assign({}, out.meta, raw.meta);
    }
    if (Array.isArray(raw.submissions)) out.submissions = raw.submissions.map(function (s) { return clone(s); });
    return out;
  }

  function read() {
    if (!HAS_STORAGE) return clone(DEFAULTS);
    try {
      const raw = global.localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULTS);
      return normalize(JSON.parse(raw));
    } catch (err) {
      return clone(DEFAULTS);
    }
  }

  function write(draft) {
    const normalized = normalize(draft);
    if (HAS_STORAGE) {
      try {
        global.localStorage.setItem(KEY, JSON.stringify(normalized));
      } catch (err) {
        /* ignore */
      }
    }
    try {
      global.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { data: normalized } }));
    } catch (err) {
      /* ignore */
    }
    return normalized;
  }

  function reset() {
    if (HAS_STORAGE) {
      try { global.localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
    }
    const defaults = clone(DEFAULTS);
    try {
      global.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { data: defaults } }));
    } catch (err) { /* ignore */ }
    return defaults;
  }

  function subscribe(cb) {
    if (typeof cb !== "function") return function () {};
    function handler(event) {
      cb(event.detail && event.detail.data ? event.detail.data : read());
    }
    global.addEventListener(CHANGE_EVENT, handler);
    // storage sync across tabs
    function storageHandler(e) {
      if (e.key === KEY) cb(read());
    }
    if (HAS_STORAGE) global.addEventListener("storage", storageHandler);
    return function unsubscribe() {
      global.removeEventListener(CHANGE_EVENT, handler);
      if (HAS_STORAGE) global.removeEventListener("storage", storageHandler);
    };
  }

  function hydrate(raw) {
    const normalized = normalize(raw);
    if (!HAS_STORAGE) return normalized;
    try {
      global.localStorage.setItem(KEY, JSON.stringify(normalized));
    } catch (err) {
      return normalized;
    }
    try {
      global.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { data: normalized } }));
    } catch (err) {
      /* ignore */
    }
    return normalized;
  }

  function isDefault() {
    try {
      return read().meta.updatedAt === null;
    } catch (err) {
      return true;
    }
  }

  global.PortalStore = {
    KEY: KEY,
    defaults: function () { return clone(DEFAULTS); },
    read: read,
    write: write,
    reset: reset,
    subscribe: subscribe,
    normalize: normalize,
    uid: uid,
    hydrate: hydrate,
    hasStorage: HAS_STORAGE,
    isDefault: isDefault,
    CHANGE_EVENT: CHANGE_EVENT
  };
})(window);
