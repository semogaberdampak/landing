(function () {
  "use strict";

  const S = window.PortalStore;
  const UI = window.PortalUI;
  if (!S || !UI) return;

  const esc = UI.escapeHTML;
  const $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  const $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  let data = S.read();
  let activeTab = "links";
  let linkQuery = "";
  let authState = null;

  const TABS = Object.assign({
    links: {
      title: "Portal",
      sub: "Kelola semua pintu yang tampil di halaman utama, lengkap dengan ikon dan warna kartunya.",
      add: "Tambah portal"
    },
    stats: {
      title: "Statistik",
      sub: "Angka singkat di bawah hero. Pakai angka yang jujur dan mudah diperbarui.",
      add: "Tambah statistik"
    },
    notes: {
      title: "Kabar",
      sub: "Agenda dan pengumuman yang tampil di bagian 'Yang lagi jalan'.",
      add: "Tambah kabar"
    },
    about: {
      title: "Tentang",
      sub: "Cerita komunitas dan tiga poin yang menjelaskan cara Portal KiTA bekerja.",
      add: null
    },
    settings: {
      title: "Tampilan",
      sub: "Atur teks hero, pita berjalan, kontak, dan catatan footer.",
      add: null
    },
    data: {
      title: "Data",
      sub: "Cadangkan, pulihkan, atau reset konten. Semua tersimpan di perangkat ini.",
      add: null
    },
    submissions: {
      title: "Usulan",
      sub: "Usulan yang dikirim pengunjung, lihat dan hapus yang sudah terkirim.",
      add: null
    }
  });

  // helpers
  function hydrateIcons(root) {
    $$(("[data-icon]", root)).forEach(function (node) {
      const size = Number(node.getAttribute("data-size")) || 20;
      node.innerHTML = UI.icon(node.getAttribute("data-icon"), size);
    });
  }

  function isoToday() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatDateTime(iso) {
    if (!iso) return "Belum pernah diubah";
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "Belum pernah diubah";
    return (
      "Terakhir disimpan " +
      date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
      ", " +
      date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    );
  }

  // reps for each panel
  function renderLinks() {
    const host = $("#linkList");
    if (!host) return;
    const query = linkQuery.trim();
    const list = data.links.filter(function (link) {
      if (!query) return true;
      const haystack = [link.title, link.desc, link.tag, link.url].join(" ").toLowerCase();
      return haystack.indexOf(query.toLowerCase()) > -1;
    });
    const count = $("#linkCount");
    if (count) count.textContent = (query ? list.length + " dari " : "") + data.links.length + " portal";

    if (!list.length) {
      host.innerHTML = '<div class="adminEmpty"><strong>' + (query ? "Tidak ada yang cocok" : "Belum ada portal") + "</strong>" +
        (query ? "Coba kata kunci lain." : "Tambahkan portal pertama lewat tombol di atas.") + "</div>";
      return;
    }
    host.innerHTML = list.map(function (link) {
      const realIndex = data.links.indexOf(link);
      return (
        '<article class="adminItem">' +
        '<span class="adminItem__icon accent-sun">' + UI.icon(link.icon, 21) + "</span>" +
        '<div class="adminItem__body">' +
        '<div class="adminItem__titleRow">' +
        '<h3 class="adminItem__title">' + esc(link.title) + "</h3>" +
        (link.featured ? '<span class="adminItem__flag">Unggulan</span>' : "") +
        "</div>" +
        '<p class="adminItem__url">' + UI.icon("link", 12) + "<span>" + esc(link.url) + "</span></p>" +
        (link.desc ? '<p class="adminItem__desc">' + esc(link.desc) + "</p>" : "") +
        '<div class="adminItem__chips"><span class="miniChip">' + esc(link.tag || "Umum") + "</span>" +
        '<span class="miniChip">' + esc(UI.iconLabel(link.icon)) + "</span></div>" +
        "</div>" +
        '<div class="adminItem__actions">' +
        '<span class="adminItem__move">' +
        '<button class="miniBtn" type="button" data-move="up" data-index="' + realIndex + '" aria-label="Naikkan ' + esc(link.title) + '"' +
        (realIndex === 0 ? " disabled" : "") + ">" + UI.icon("up", 16) + "</button>" +
        '<button class="miniBtn" type="button" data-move="down" data-index="' + realIndex + '" aria-label="Turunkan ' + esc(link.title) + '"' +
        (realIndex === data.links.length - 1 ? " disabled" : "") + ">" + UI.icon("down", 16) + "</button></span>" +
        '<button class="miniBtn" type="button" data-edit="' + realIndex + '" aria-label="Ubah ' + esc(link.title) + '">' +
        UI.icon("edit", 16) + "</button>" +
        '<button class="miniBtn miniBtn--danger" type="button" data-delete="' + realIndex + '" aria-label="Hapus ' + esc(link.title) + '">' +
        UI.icon("trash", 16) + "</button>" +
        "</div></article>"
      );
    }).join("");
  }

  function renderStats() {
    const host = $("#statList");
    if (!host) return;
    const count = $("#statCount");
    if (count) count.textContent = data.stats.length + " statistik";
    host.innerHTML = data.stats.length
      ? data.stats.map(function (stat, index) {
          return (
            '<article class="adminItem">' +
            '<span class="adminItem__icon accent-plum">' + UI.icon("target", 21) + "</span>" +
            '<div class="adminItem__body"><div class="adminItem__titleRow">' +
            '<h3 class="adminItem__title">' + esc(stat.label || "Tanpa label") + "</h3>" +
            '<span class="adminItem__flag">' + esc(stat.value || "0") + "</span></div>" +
            (stat.note ? '<p class="adminItem__desc">' + esc(stat.note) + "</p>" : "") +
            "</div>" +
            '<div class="adminItem__actions"><span class="adminItem__move">' +
            '<button class="miniBtn" type="button" data-move="up" data-index="' + index + '" aria-label="Naikkan statistik"' +
            (index === 0 ? " disabled" : "") + ">" + UI.icon("up", 16) + "</button>" +
            '<button class="miniBtn" type="button" data-move="down" data-index="' + index + '" aria-label="Turunkan statistik"' +
            (index === data.stats.length - 1 ? " disabled" : "") + ">" + UI.icon("down", 16) + "</button></span>" +
            '<button class="miniBtn" type="button" data-edit="' + index + '" aria-label="Ubah statistik">' +
            UI.icon("edit", 16) + "</button>" +
            '<button class="miniBtn miniBtn--danger" type="button" data-delete="' + index + '" aria-label="Hapus statistik">' +
            UI.icon("trash", 16) + "</button></div></article>"
          );
        }).join("")
      : '<div class="adminEmpty"><strong>Belum ada statistik</strong>Tambahkan angka yang ingin ditonjolkan.</div>';
  }

  function renderNotes() {
    const host = $("#noteList");
    if (!host) return;
    const count = $("#noteCount");
    if (count) count.textContent = data.notes.length + " kabar";
    host.innerHTML = data.notes.length
      ? data.notes.map(function (note, index) {
          return (
            '<article class="adminItem">' +
            '<span class="adminItem__icon accent-sun">' + UI.icon("pen", 21) + "</span>" +
            '<div class="adminItem__body"><div class="adminItem__titleRow">' +
            '<h3 class="adminItem__title">' + esc(note.title) + "</h3>" +
            "</div>" +
            '<p class="adminItem__url">' + UI.icon("calendar", 12) + "<span>" +
            (note.date ? UI.formatDate(note.date) : "tanpa tanggal") + "</span></p>" +
            '<p class="adminItem__desc">' + esc(note.body) + "</p>" +
            '<div class="adminItem__chips"><span class="miniChip">' + esc(note.tag || "Info") + "</span></div></div>" +
            '<div class="adminItem__actions"><span class="adminItem__move">' +
            '<button class="miniBtn" type="button" data-move="up" data-index="' + index + '" aria-label="Naikkan kabar"' +
            (index === 0 ? " disabled" : "") + ">" + UI.icon("up", 16) + "</button>" +
            '<button class="miniBtn" type="button" data-move="down" data-index="' + index + '" aria-label="Turunkan kabar"' +
            (data.notes.length - 1 === index ? " disabled" : "") + ">" + UI.icon("down", 16) + "</button></span>" +
            '<button class="miniBtn" type="button" data-edit="' + index + '" aria-label="Ubah kabar">' +
            UI.icon("edit", 16) + "</button>" +
            '<button class="miniBtn miniBtn--danger" type="button" data-delete="' + index + '" aria-label="Hapus kabar">' +
            UI.icon("trash", 16) + "</button></div></article>"
          );
        }).join("")
      : '<div class="adminEmpty"><strong>Belum ada kabar</strong>Tulis agenda atau pengumuman pertama.</div>';
  }

  function renderPoints() {
    const host = $("#pointList");
    if (!host) return;
    const points = data.site.aboutPoints || [];
    host.innerHTML = points.length
      ? points.map(function (point, index) {
          return (
            '<article class="adminItem">' +
            '<span class="adminItem__icon accent-mint">' + UI.icon("leaf", 21) + "</span>" +
            '<div class="adminItem__body"><div class="adminItem__titleRow">' +
            '<h3 class="adminItem__title">' + esc(point.title || "Poin tanpa judul") + "</h3></div>" +
            '<p class="adminItem__desc">' + esc(point.text || "") + "</p></div>" +
            '<div class="adminItem__actions"><span class="adminItem__move">' +
            '<button class="miniBtn" type="button" data-move="up" data-index="' + index + '" aria-label="Naikkan poin"' +
            (index === 0 ? " disabled" : "") + ">" + UI.icon("up", 16) + "</button>" +
            '<button class="miniBtn" type="button" data-move="down" data-index="' + index + '" aria-label="Turunkan poin"' +
            (points.length - 1 === index ? " disabled" : "") + ">" + UI.icon("down", 16) + "</button></span>" +
            '<button class="miniBtn" type="button" data-edit="' + index + '" aria-label="Ubah poin">' +
            UI.icon("edit", 16) + "</button>" +
            '<button class="miniBtn miniBtn--danger" type="button" data-delete="' + index + '" aria-label="Hapus poin">' +
            UI.icon("trash", 16) + "</button></div></article>"
          );
        }).join("")
      : '<div class="adminEmpty"><strong>Belum ada titik sorot</strong>Tambah satu poin singkat.</div>';
  }

  function renderDataSummary() {
    const host = $("#dataStats");
    if (host) {
      host.innerHTML = [
        { label: "Portal", value: data.links.length },
        { label: "Statistik", value: data.stats.length },
        { label: "Kabar", value: data.notes.length },
        { label: "Titik sorot", value: (data.site.aboutPoints || []).length }
      ]
        .map(function (item) {
          return (
            '<div class="dataStat"><b>' + item.value + "</b><span>" + item.label + "</span></div>"
          );
        }).join("");
    }
    const lastSaved = $("#lastSaved");
    if (lastSaved) lastSaved.textContent = formatDateTime(data.meta.updatedAt);
    const meter = $("#storageMeter");
    if (meter) {
      try {
        const raw = localStorage.getItem(S.KEY) || "";
        const kb = new Blob([raw]).size / 1024;
        meter.textContent = raw ? kb.toFixed(1).replace(".", ",") + " KB terpakai" : "Belum ada data tersimpan";
      } catch (err) {
        meter.textContent = "Penyimpanan lokal aktif";
      }
    }
  }

  function renderSubmissions() {
    const host = $("#submissionList");
    if (!host) return;
    const count = $("#submissionCount");
    if (count) count.textContent = authState ? (data.submissions || []).length : "—";
    if (!authState) {
      host.innerHTML = '<div class="adminEmpty"><strong>Belum login</strong></div>';
      return;
    }
    const subs = data.submissions || [];
    if (!subs.length) {
      host.innerHTML = '<div class="adminEmpty"><strong>Belum ada usulan</strong></div>';
      return;
    }
    host.innerHTML = subs.map(function (s) {
      const date = s.created_at ? new Date(String(s.created_at)) : null;
      const dateText = date && !isNaN(date.getTime())
        ? "Diperbarui " + date.toLocaleString("id-ID")
        : "Sejak dulu";
      return (
        '<article class="adminItem">' +
        '<span class="adminItem__icon accent-sun">' + UI.icon("chat", 21) + "</span>" +
        '<div class="adminItem__body">' +
        '<div class="adminItem__titleRow">' +
        '<h3 class="adminItem__title">' + esc(s.portal_name || "—") + "</h3>" +
        '<span class="adminItem__flag">' + esc(s.portal_url || "—") + "</span></div>" +
        '<p class="adminItem__desc">' + (s.message ? esc(s.message) : "—") + "</p>" +
        '<p class="adminItem__url adminItem__url">' + UI.icon("calendar", 12) +
        "<span>" + esc(s.name || "—") + " · " + (s.contact || "—") + "</span></p>" +
        '<p class="adminItem__desc">' + (dateText ? "Dikirim " + dateText : "") + "</p>" +
        "</div>" +
        '<div class="adminItem__actions">' +
        '<button class="miniBtn miniBtn--danger" type="button" data-delete-submission="' + esc(s.id) + '" aria-label="Hapus usulan">' +
        UI.icon("trash", 16) + "</button>" +
        "</div></article>"
      );
    }).join("");
  }

  function fillSettings() {
    $$("[data-settings-form]").forEach(function (form) {
      $$("[data-site]", form).forEach(function (input) {
        const key = input.getAttribute("name");
        const value = data.site[key];
        input.value = Array.isArray(value) ? value.join("\n") : value == null ? "" : value;
      });
    });
    const aboutForm = $("#aboutForm");
    if (aboutForm) {
      aboutForm.elements.aboutTitle.value = data.site.aboutTitle || "";
      aboutForm.elements.aboutText.value = data.site.aboutText || "";
    }
  }

  function switchTab(tab) {
    if (!TABS[tab]) return;
    if (window.PORTAL_SUPABASE && window.PortalBackend.configured && !authState) {
      return;
    }
    activeTab = tab;
    tabNavItems().forEach(function (item) {
      item.classList.toggle("is-active", item.getAttribute("data-tab") === tab);
    });
    $$(".adminPanel").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-panel") !== tab;
    });
    const meta = TABS[tab];
    const title = $("#adminTitle");
    if (title) title.textContent = meta.title;
    const sub = $("#adminSub");
    if (sub) sub.textContent = meta.sub;
    const addBtn = $("#addBtn");
    const addLabel = $("#addBtnLabel");
    if (addBtn) addBtn.hidden = !meta.add;
    if (addLabel && meta.add) addLabel.textContent = meta.add;
    document.title = meta.title + " — Panel Pengelola Portal KiTA";
    if (window.scrollY > 80) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function confirmDelete(collectionKey, index, label, title) {
    const item = data[collectionKey] && data[collectionKey][index];
    if (!item) return;
    UI.confirm({
      title: "Hapus " + title + "?",
      eyebrow: "Hapus data",
      message: "“" + (item.title || item.label || "Item ini") + "” akan dihapus dari website.",
      detail: "Kamu masih bisa mengembalikannya lewat cadangan JSON.",
      confirmLabel: "Ya, hapus",
      danger: true,
      icon: "trash"
    }).then(function (ok) {
      if (!ok) return;
      persist(function (draft) {
        draft[collectionKey].splice(index, 1);
      }, label + " dihapus.");
    });
  }

  function moveItem(collection, index, direction) {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= data[collection].length) return;
    persist(function (draft) {
      const list = draft[collection];
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
    });
  }

  function movePoint(index, direction) {
    const target = direction === "up" ? index - 1 : index + 1;
    const points = data.site.aboutPoints || [];
    if (target < 0 || target >= points.length) return;
    persist(function (draft) {
      const list = draft.site.aboutPoints;
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
    });
  }

  function persist(mutator, toastMessage) {
    const draft = JSON.parse(JSON.stringify(data));
    try {
      mutator(draft);
      data = S.write(draft);
      renderAll();
      flashSaved();
      if (toastMessage) UI.toast(toastMessage, { type: "success" });
      return true;
    } catch (err) {
      UI.alert({
        title: "Gagal menyimpan",
        message: err && err.message ? err.message : "Terjadi kesalahan saat menyimpan.",
        detail: "Coba hapus beberapa entri atau unduh cadangan lalu reset.",
        icon: "alert",
        tone: "danger"
      });
      return false;
    }
  }

  // forms
  function openLinkForm(link, index) {
    const isEdit = typeof index === "number";
    UI.formDialog({
      title: isEdit ? "Ubah portal" : "Tambah portal",
      eyebrow: "Kelola portal",
      desc: isEdit
        ? "Perubahan langsung muncul di halaman utama."
        : "Isi alamat tujuan dan deskripsi singkat supaya pengunjung tahu isinya.",
      size: "lg",
      submitLabel: isEdit ? "Simpan perubahan" : "Tambahkan portal",
      values: link || { icon: "spark", accent: "sun", featured: false, tag: "Umum", url: "https://" },
      fields: [
        { name: "title", label: "Nama portal", placeholder: "Mis. Ruang Belajar", required: true, maxLength: 48 },
        { name: "tag", label: "Kategori", placeholder: "Mis. Belajar", maxLength: 22 },
        { name: "url", label: "Alamat tujuan", type: "url", placeholder: "https://contoh.id/ruang", required: true, full: true,
          hint: "Boleh tautan penuh, #anchor, atau alamat email (mailto:)." },
        { name: "desc", label: "Deskripsi singkat", type: "textarea", rows: 3, full: true, maxLength: 200,
          placeholder: "Apa yang bisa dilakukan pengunjung di ruang ini?" },
        { name: "icon", label: "Ikon kartu", type: "icons", full: true },
        { name: "featured", label: "Kartu unggulan", type: "checkbox", checkboxLabel: "Tampilkan sebagai kartu besar di baris pertama" }
      ]
    }).then(function (result) {
      if (!result) return;
      persist(function (draft) {
        if (isEdit) {
          draft.links[index] = Object.assign({}, draft.links[index], result);
        } else {
          result.id = S.uid("ln");
          draft.links.unshift(result);
        }
      }, isEdit ? "Portal diperbarui." : "Portal baru ditambahkan.");
    });
  }

  function openStatForm(stat, index) {
    const isEdit = typeof index === "number";
    UI.formDialog({
      title: isEdit ? "Ubah statistik" : "Tambah statistik",
      eyebrow: "Statistik",
      desc: "Angka singkat di bawah hero. Tiga sampai empat angka paling enak dibaca.",
      values: stat || {},
      submitLabel: isEdit ? "Simpan" : "Tambahkan",
      fields: [
        { name: "value", label: "Angka", placeholder: "Mis. 340+", required: true, maxLength: 12 },
        { name: "label", label: "Label", placeholder: "Mis. Anak muda", required: true, maxLength: 30 },
        { name: "note", label: "Catatan kecil", placeholder: "Mis. dari 6 kota", full: true, maxLength: 40 }
      ]
    }).then(function (result) {
      if (!result) return;
      persist(function (draft) {
        if (isEdit) draft.stats[index] = Object.assign({}, draft.stats[index], result);
        else {
          result.id = S.uid("st");
          draft.stats.push(result);
        }
      }, isEdit ? "Statistik diperbarui." : "Statistik ditambahkan.");
    });
  }

  function openNoteForm(note, index) {
    const isEdit = typeof index === "number";
    UI.formDialog({
      title: isEdit ? "Ubah kabar" : "Tambah kabar",
      eyebrow: "Kabar KiTA",
      desc: "Tulis singkat: apa, kapan, dan bagaimana cara ikutnya.",
      size: "lg",
      values: note || { date: isoToday(), tag: "Info" },
      submitLabel: isEdit ? "Simpan" : "Terbitkan",
      fields: [
        { name: "title", label: "Judul", required: true, maxLength: 80, full: true },
        { name: "tag", label: "Label", placeholder: "Agenda / Panggung / Info", maxLength: 20 },
        { name: "date", label: "Tanggal", type: "date" },
        { name: "body", label: "Isi kabar", type: "textarea", rows: 4, required: true, full: true, maxLength: 320 }
      ]
    }).then(function (result) {
      if (!result) return;
      persist(function (draft) {
        if (isEdit) draft.notes[index] = Object.assign({}, draft.notes[index], result);
        else {
          result.id = S.uid("nt");
          draft.notes.unshift(result);
        }
      }, isEdit ? "Kabar diperbarui." : "Kabar baru diterbitkan.");
    });
  }

  function openPointForm(point, index) {
    const isEdit = typeof index === "number";
    UI.formDialog({
      title: isEdit ? "Ubah poin" : "Tambah poin",
      eyebrow: "Tentang",
      desc: "Satu poin = satu kalimat judul dan penjelasan pendek.",
      values: point || {},
      submitLabel: isEdit ? "Simpan" : "Tambahkan",
      fields: [
        { name: "title", label: "Judul poin", required: true, maxLength: 60, full: true },
        { name: "text", label: "Penjelasan", type: "textarea", rows: 3, required: true, full: true, maxLength: 200 }
      ]
    }).then(function (result) {
      if (!result) return;
      persist(function (draft) {
        const points = draft.site.aboutPoints || (draft.site.aboutPoints = []);
        if (isEdit) points[index] = Object.assign({}, points[index], result);
        else points.push(result);
      }, isEdit ? "Poin diperbarui." : "Poin ditambahkan.");
    });
  }

  const LOCAL_AUTH_KEY = "portal-kita:admin:v1";
  const LOCAL_SESSION_KEY = "portal-kita:admin:session:v1";
  const LOCAL_SESSION_TTL = 60 * 60 * 1000; // 1 jam

  function bytesToHex(buf) {
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }

  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return bytesToHex(hash);
  }

  function localAuthRecord() {
    try { return JSON.parse(localStorage.getItem(LOCAL_AUTH_KEY) || "null"); } catch (e) { return null; }
  }

  function hasLocalPassword() {
    const rec = localAuthRecord();
    return !!(rec && rec.salt && rec.hash);
  }

  async function setLocalPassword(password) {
    const salt = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now().toString(36));
    const hash = await sha256(salt + "::" + password);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ salt: salt, hash: hash, createdAt: Date.now() }));
  }

  async function verifyLocalPassword(password) {
    const rec = localAuthRecord();
    if (!rec) return false;
    const hash = await sha256(rec.salt + "::" + password);
    return hash === rec.hash;
  }

  function isLocalSessionValid() {
    try {
      const raw = sessionStorage.getItem(LOCAL_SESSION_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      return !!(s && s.expires && s.expires > Date.now());
    } catch (e) { return false; }
  }

  function createLocalSession() {
    try { sessionStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ expires: Date.now() + LOCAL_SESSION_TTL })); } catch (e) {}
  }

  function clearLocalSession() {
    try { sessionStorage.removeItem(LOCAL_SESSION_KEY); } catch (e) {}
  }

  function showLocalGate(mode) {
    const gate = $("#authGate");
    const page = $(".admin");
    const emailField = $("#authEmailField");
    const confirmField = $("#authConfirmField");
    const hint = $("#authHint");
    const submit = $("#authSubmit");
    const title = gate ? gate.querySelector("h2") : null;
    const sub = gate ? gate.querySelector("p") : null;
    if (emailField) emailField.hidden = true;
    if (gate) gate.hidden = false;
    if (page) page.hidden = true;
    if (mode === "setup") {
      if (confirmField) confirmField.hidden = false;
      if (title) title.textContent = "Buat kata sandi admin";
      if (sub) sub.textContent = "Pertama kali: buat kata sandi untuk panel ini.";
      if (hint) hint.textContent = "Minimal 8 karakter. Simpan kata sandi ini baik-baik.";
      if (submit) submit.textContent = "Simpan kata sandi";
    } else {
      if (confirmField) confirmField.hidden = true;
      if (title) title.textContent = "Login pengelola";
      if (sub) sub.textContent = "Masukkan kata sandi admin.";
      if (hint) hint.textContent = "";
      if (submit) submit.textContent = "Masuk";
    }
  }

  function initAuth() {
    const gate = $("#authGate");
    const page = $(".admin");
    const state = $("#syncState");
    const logoutBtn = $("#logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        clearLocalSession();
        authState = null;
        if (window.PORTAL_SUPABASE && window.PortalBackend.configured) {
          try { window.PortalBackend.signOut(); } catch (e) {}
        }
        location.reload();
      });
    }

    /* mode cloud (Supabase) */
    if (window.PORTAL_SUPABASE && window.PortalBackend.configured) {
      const session = window.PortalBackend.readSession();
      authState = session;
      if (session) {
        if (gate) gate.hidden = true;
        if (page) page.hidden = false;
        if (state) state.textContent = "Login ok, menunggu sinkron.";
        if (logoutBtn) logoutBtn.hidden = false;
      if (logoutBtn) logoutBtn.addEventListener("click", function () { clearLocalSession(); authState = null; try { window.PortalBackend.signOut(); } catch (e) {} location.reload(); });
        return;
      }
      if (gate) gate.hidden = false;
      if (page) page.hidden = true;
      if (state) state.textContent = "Mode cloud (offline)";
      const emailField = $("#authEmailField");
      const confirmField = $("#authConfirmField");
      if (emailField) emailField.hidden = false;
      if (confirmField) confirmField.hidden = true;

      const submit = $("#authSubmit");
      if (submit) {
        submit.addEventListener("click", async function () {
          const email = (($("#authEmail") || {}).value || "").trim();
          const password = ($("#authPassword") || {}).value || "";
          if (!email || !password) {
            UI.toast("Isi email dan kata sandi.", { type: "warn" });
            return;
          }
          try {
            await window.PortalBackend.signIn(email, password);
            authState = window.PortalBackend.readSession();
            if (gate) gate.hidden = true;
            if (page) page.hidden = false;
            if (state) state.textContent = "Login ok.";
            if (logoutBtn) logoutBtn.hidden = false;
            await refreshDataFromCloud();
            initSubscription();
          } catch (err) {
            UI.toast((err && err.message) || "Gagal login.", { type: "danger" });
          }
        });
      }
      return;
    }

    /* mode lokal: gate kata sandi */
    if (state) state.textContent = "Mode lokal";
    if (!hasLocalPassword()) {
      showLocalGate("setup");
    } else if (isLocalSessionValid()) {
      if (gate) gate.hidden = true;
      if (page) page.hidden = false;
      if (logoutBtn) logoutBtn.hidden = false;
      return;
    } else {
      showLocalGate("login");
    }

    const submit = $("#authSubmit");
    if (submit) {
      submit.addEventListener("click", async function () {
        const password = ($("#authPassword") || {}).value || "";
        const password2 = ($("#authPassword2") || {}).value || "";
        if (!hasLocalPassword()) {
          if (password.length < 8) {
            UI.toast("Kata sandi minimal 8 karakter.", { type: "warn" });
            return;
          }
          if (password !== password2) {
            UI.toast("Konfirmasi kata sandi tidak cocok.", { type: "warn" });
            return;
          }
          try {
            await setLocalPassword(password);
            createLocalSession();
            if (gate) gate.hidden = true;
            if (page) page.hidden = false;
            if (logoutBtn) logoutBtn.hidden = false;
            UI.toast("Kata sandi admin tersimpan.", { type: "success" });
          } catch (err) {
            UI.toast("Gagal menyimpan kata sandi.", { type: "danger" });
          }
          return;
        }
        const ok = await verifyLocalPassword(password);
        if (!ok) {
          UI.toast("Kata sandi salah.", { type: "danger" });
          return;
        }
        createLocalSession();
        if (gate) gate.hidden = true;
        if (page) page.hidden = false;
        if (logoutBtn) logoutBtn.hidden = false;
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        clearLocalSession();
        authState = null;
        if (window.PORTAL_SUPABASE && window.PortalBackend.configured) {
          try { window.PortalBackend.signOut(); } catch (e) {}
        }
        location.reload();
      });
    }
  }

  function initSubscription() {
    const host = $("#submissionList");
    const count = $("#submissionCount");
    if (!host) return;
    if (!window.PORTAL_SUPABASE || !window.PortalBackend.configured) {
      host.innerHTML = '<div class="adminEmpty"><strong>Syuntikan belum aktif</strong><p>Matikan Supabase agar panel admin tetap mode lokal.</p></div>';
      return;
    }
    window.PortalBackend.getSubmissions().then(function (list) {
      if (!authState) {
        host.innerHTML = '<div class="adminEmpty"><strong>Belum login</strong></div>';
        return;
      }
      data.submissions = list;
      renderSubmissions();
      if (count) count.textContent = list.length;
    }).catch(function () {
      host.innerHTML = '<div class="adminEmpty"><strong>Gagal membuka</strong></div>';
    });
  }

  function flashSaved() {
    const state = $("#saveState");
    if (!state) return;
    state.classList.remove("is-flash");
    void state.offsetWidth;
    state.classList.add("is-flash");
    state.classList.toggle("is-offline", !navigator.onLine);
    const label = state.querySelector("span:last-child");
    if (label) label.textContent = navigator.onLine ? "Tersimpan otomatis" : "Tersimpan offline";
  }

  function renderAll() {
    renderLinks();
    renderStats();
    renderNotes();
    renderPoints();
    renderDataSummary();
    renderSubmissions();
    fillSettings();
    updateCounts();
    hydrateIcons();
  }

  function updateCounts() {
    $$("[data-count]").forEach(function (node) {
      const key = node.getAttribute("data-count");
      if (key === "links") node.textContent = data.links.length;
      if (key === "stats") node.textContent = data.stats.length;
      if (key === "notes") node.textContent = data.notes.length;
    });
  }

  function initListEvents() {
    document.addEventListener("click", function (event) {
      const moveBtn = event.target.closest("[data-move]");
      const editBtn = event.target.closest("[data-edit]");
      const deleteBtn = event.target.closest("[data-delete]");
      if (!moveBtn && !editBtn && !deleteBtn) return;

      const panel = event.target.closest("[data-panel]");
      const panelName = panel ? panel.getAttribute("data-panel") : activeTab;
      const index = Number((moveBtn || editBtn || deleteBtn).getAttribute("data-index"));

      if (panelName === "links") {
        if (moveBtn) moveItem("links", index, moveBtn.getAttribute("data-move"));
        if (editBtn) openLinkForm(data.links[index], index);
        if (deleteBtn) confirmDelete("links", index, "Portal", "portal");
      } else if (panelName === "stats") {
        if (moveBtn) moveItem("stats", index, moveBtn.getAttribute("data-move"));
        if (editBtn) openStatForm(data.stats[index], index);
        if (deleteBtn) confirmDelete("stats", index, "Statistik", "statistik");
      } else if (panelName === "notes") {
        if (moveBtn) moveItem("notes", index, moveBtn.getAttribute("data-move"));
        if (editBtn) openNoteForm(data.notes[index], index);
        if (deleteBtn) {
          const sub = event.target.closest("[data-delete-submission]");
          if (sub) {
            const id = sub.getAttribute("data-delete-submission");
            UI.confirm({
              title: "Hapus usulan?",
              eyebrow: "Hapus data",
              message: "Usulan ini akan dihapus dari database dan layar admin.",
              detail: "Tindakan ini tidak bisa dibatalkan.",
              confirmLabel: "Ya, hapus",
              danger: true,
              icon: "trash"
            }).then(function (ok) {
              if (!ok) return;
              persist(function (draft) {
                draft.submissions = (draft.submissions || []).filter(function (s) { return s.id !== id; });
              }, "Usulan dihapus.");
              window.PortalBackend.deleteSubmission(id).catch(function () { /* tunda */ });
            });
            return;
          }
          if (moveBtn) moveItem("notes", index, moveBtn.getAttribute("data-move"));
          if (editBtn) openNoteForm(data.notes[index], index);
          if (deleteBtn) confirmDelete("notes", index, "Kabar", "kabar");
        }
      } else if (panelName === "about") {
        if (moveBtn) movePoint(index, moveBtn.getAttribute("data-move"));
        if (editBtn) openPointForm(data.site.aboutPoints[index], index);
        if (deleteBtn) {
          const point = data.site.aboutPoints[index];
          if (!point) return;
          UI.confirm({
            title: "Hapus poin?",
            eyebrow: "Titik sorot",
            message: "“" + point.title + "” akan dihapus dari bagian tentang.",
            detail: "",
            confirmLabel: "Hapus poin",
            danger: true
          }).then(function (ok) {
            if (!ok) return;
            persist(function (draft) {
              draft.site.aboutPoints.splice(index, 1);
            }, "Poin dihapus.");
          });
        }
      }
    });

    const search = $("#linkSearch");
    if (search) {
      let timer = null;
      search.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          linkQuery = search.value;
          renderLinks();
        }, 120);
      });
    }
  }

  function initAddButton() {
    const addBtn = $("#addBtn");
    if (!addBtn) return;
    addBtn.addEventListener("click", function () {
      if (activeTab === "links") openLinkForm();
      else if (activeTab === "stats") openStatForm();
      else if (activeTab === "notes") openNoteForm();
    });
    const addPointBtn = $("#addPointBtn");
    if (addPointBtn) addPointBtn.addEventListener("click", function () {
      openPointForm();
    });
  }

  async function refreshDataFromCloud() {
    if (!window.PORTAL_SUPABASE || !window.PortalBackend.configured || !authState) return;
    try {
      const remote = await window.PortalBackend.getContent();
      if (remote) {
        data = S.hydrate(remote);
        renderAll();
      }
    } catch (err) {
      /* mode offline / sedang login: biarkan yang lama */
    }
  }

  function initConnection() {
    const banner = $("#offlineBanner");
    const state = $("#saveState");
    const label = state ? state.querySelector("span:last-child") : null;

    function sync(notify) {
      const offline = !navigator.onLine;
      if (banner) banner.hidden = !offline;
      if (state) {
        state.classList.toggle("is-offline", offline);
        const iconWrap = state.querySelector("span:first-child");
        if (iconWrap) iconWrap.innerHTML = UI.icon(offline ? "offline" : "check", 14);
      }
      if (label) label.textContent = offline ? "Tersimpan offline" : "Tersimpan otomatis";
      if (notify) {
        UI.toast(
          offline ? "Offline. Perubahan tetap aman di perangkat ini." : "Tersambung lagi. Panel siap dipakai normal.",
          { type: offline ? "warn" : "success" }
        );
      }
    }

    window.addEventListener("online", function () { sync(true); });
    window.addEventListener("offline", function () { sync(true); });
    sync(false);
  }

  function initLoader() {
    const bar = $("#loaderBar");
    const loader = $("#loader");
    if (bar) bar.style.width = "45%";
    window.setTimeout(function () { if (bar) bar.style.width = "80%"; }, 260);

    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      if (bar) bar.style.width = "100%";
      setTimeout(function () { if (loader) loader.classList.add("is-done"); }, 120);
      setTimeout(function () {
        if (loader) loader.remove();
      }, 460);
    }

    if (document.readyState === "complete") finish();
    else {
      window.setTimeout(finish, 260);
      window.addEventListener("load", finish, { once: true });
    }
  }

  function initSettingsForms() {
    $$("[data-settings-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        persist(function (draft) {
          $$("[data-site]", form).forEach(function (input) {
            const name = input.getAttribute("name");
            if (name === "marquee") {
              draft.site.marquee = String(input.value || "")
                .split(/\n/)
                .map(function (x) { return x.trim(); })
                .filter(Boolean);
            } else {
              draft.site[name] = input.value;
            }
          });
        }, "Pengaturan disimpan.");
        const state = form.querySelector("[data-state]");
        if (state) state.textContent = "Tersimpan";
      });
    });
    const aboutForm = $("#aboutForm");
    if (aboutForm) {
      aboutForm.addEventListener("submit", function (event) {
        event.preventDefault();
        persist(function (draft) {
          draft.site.aboutTitle = aboutForm.elements.aboutTitle.value;
          draft.site.aboutText = aboutForm.elements.aboutText.value;
        }, "Teks tentang disimpan.");
        const state = aboutForm.querySelector("[data-state]");
        if (state) state.textContent = "Tersimpan";
      });
    }
  }

  function initDataTools() {
    const exportBtn = $("#exportBtn");
    const importBtn = $("#importBtn");
    const importFile = $("#importFile");
    const resetBtn = $("#resetBtn");

    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "portal-kita-data.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        UI.toast("Cadangan diunduh.", { type: "success" });
      });
    }
    if (importBtn && importFile) {
      importBtn.addEventListener("click", function () { importFile.click(); });
      importFile.addEventListener("change", function () {
        const file = importFile.files && importFile.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
          try {
            const parsed = JSON.parse(String(reader.result || ""));
            data = S.write(parsed);
            renderAll();
            UI.toast("Data dipulihkan.", { type: "success" });
          } catch (err) {
            UI.alert({ title: "Gagal membaca berkas", message: "Pastikan berkas JSON yang valid.", icon: "alert", tone: "danger" });
          }
        };
        reader.readAsText(file);
        importFile.value = "";
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        UI.confirm({
          title: "Reset ke konten contoh?",
          eyebrow: "Data",
          message: "Semua perubahan akan dihapus dan konten contoh dikembalikan.",
          detail: "Tindakan ini tidak bisa dibatalkan.",
          confirmLabel: "Ya, reset",
          danger: true,
          icon: "refresh"
        }).then(function (ok) {
          if (!ok) return;
          data = S.reset();
          renderAll();
          UI.toast("Dikembalikan ke konten contoh.", { type: "success" });
        });
      });
    }
  }

  function start() {
    hydrateIcons();
    initLoader();
    initSettingsForms();
    initDataTools();
    initConnection();
    initListEvents();
    initAddButton();
    initSubscription();
    initAuth();
    renderAll();
    refreshDataFromCloud();

    S.subscribe(function (next) {
      data = next;
      renderAll();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
