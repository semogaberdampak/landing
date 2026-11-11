/* Portal KiTA — landing.js
   Merender konten dari localStorage (PortalStore) ke layout bento.
   Tidak memakai alert bawaan browser: semua notifikasi lewat PortalUI.
*/
(function () {
  "use strict";

  const S = window.PortalStore;
  const UI = window.PortalUI;

  if (!S || !UI) return;

  const $ = function (sel) {
    return document.querySelector(sel);
  };
  const esc = UI.escapeHTML;

  let deferredPrompt = null;
  let hideLoaderTimer = null;
  let loaderDone = false;

  /* ---------- ikon placeholder ---------- */
  function hydrateIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach(function (node) {
      const size = Number(node.getAttribute("data-size")) || 20;
      node.innerHTML = UI.icon(node.getAttribute("data-icon"), size);
    });
  }

  /* ---------- loader ---------- */
  function setLoaderProgress(value, hint) {
    const bar = $("#loaderBar");
    if (bar) bar.style.width = Math.max(6, Math.min(100, value)) + "%";
    if (hint) {
      const hintEl = $("#loaderHint");
      if (hintEl) hintEl.textContent = hint;
    }
  }

  function hideLoader() {
    if (loaderDone) return;
    loaderDone = true;
    setLoaderProgress(100, "Selamat datang.");
    const loader = $("#loader");
    setTimeout(function () {
      loader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      setTimeout(function () {
        loader.remove();
      }, 460);
    }, 120);
  }

  function bootLoader() {
    setLoaderProgress(24);
    window.setTimeout(function () {
      if (!loaderDone) setLoaderProgress(58, "Menata ruang…");
    }, 520);
    window.setTimeout(function () {
      if (!loaderDone) setLoaderProgress(82, "Hampir selesai…");
    }, 1200);

    const start = performance.now();
    const MIN_SHOW = 480;

    // konten sudah dirender sinkron; tidak perlu menunggu font/aset jaringan selesai
    function ready() {
      const wait = Math.max(0, MIN_SHOW - (performance.now() - start));
      window.setTimeout(hideLoader, wait);
    }

    window.setTimeout(ready, 60);
    // jaring pengaman: jangan biarkan loader menggantung
    hideLoaderTimer = window.setTimeout(hideLoader, 3500);
    window.addEventListener("load", function () {
      clearTimeout(hideLoaderTimer);
    }, { once: true });
  }

  /* ---------- render konten ---------- */
  function renderSite(site) {
    const badge = $("#heroBadge");
    if (badge) badge.textContent = site.badge || "";

    const title = $("#heroTitle");
    if (title) {
      const raw = String(site.heroTitle || "Portal KiTA").trim();
      const hi = String(site.heroHighlight || "").trim();
      let html = esc(raw);
      if (hi) {
        const idx = raw.toLowerCase().indexOf(hi.toLowerCase());
        if (idx > -1) {
          html =
            esc(raw.slice(0, idx)) +
            '<span class="grad">' +
            esc(raw.slice(idx, idx + hi.length)) +
            "</span>" +
            esc(raw.slice(idx + hi.length));
        }
      }
      title.innerHTML = html;
    }

    const lead = $("#heroLead");
    if (lead) lead.textContent = site.heroLead || "";

    const text = $("#heroText");
    if (text) text.textContent = site.heroText || "";

    const ctaPrimary = $("#ctaPrimary");
    if (ctaPrimary) {
      const label = ctaPrimary.querySelector("span:first-child");
      if (label) label.textContent = site.ctaPrimary || "Jelajahi Portal";
    }

    const ctaSecondary = $("#ctaSecondary");
    if (ctaSecondary) {
      const label = ctaSecondary.querySelector("span:first-child");
      if (label) label.textContent = site.ctaSecondary || "Baca Kabar";
    }

    const status = $("#heroStatus");
    if (status) status.textContent = site.statusText || "Portal lagi aktif";

    const aboutTitle = $("#aboutTitle");
    if (aboutTitle) aboutTitle.textContent = site.aboutTitle || "";

    const aboutText = $("#aboutText");
    if (aboutText) aboutText.textContent = site.aboutText || "";

    const points = $("#aboutPoints");
    if (points) {
      points.innerHTML = (site.aboutPoints || [])
        .map(function (point) {
          return (
            '<div class="point">' +
            '<span class="point__mark" aria-hidden="true"></span>' +
            "<div>" +
            '<p class="point__title">' +
            esc(point.title || "") +
            "</p>" +
            '<p class="point__text">' +
            esc(point.text || "") +
            "</p>" +
            "</div></div>"
          );
        })
        .join("");
    }

    const contactBtn = $("#contactBtn");
    if (contactBtn) {
      const url = String(site.contactUrl || "mailto:halo@portalkita.id");
      contactBtn.href = /^(https?:|mailto:|tel:|\/|#)/i.test(url) ? url : "mailto:" + url;
      if (/^https?:/i.test(url)) {
        contactBtn.target = "_blank";
        contactBtn.rel = "noopener";
      }
    }
    const contactLabel = $("#contactLabel");
    if (contactLabel) contactLabel.textContent = site.contactLabel || "Sapa Kami";

    const footerNote = $("#footerNote");
    if (footerNote) footerNote.textContent = site.footerNote || "";

    const installHint = $("#installHint");
    if (installHint) installHint.textContent = site.installHint || installHint.textContent;

    document.title = (site.brand || "Portal KiTA") + " — satu pintu, banyak ruang";
  }

  function renderStats(stats) {
    const host = $("#heroStats");
    if (!host) return;
    host.innerHTML = (stats || [])
      .map(function (stat) {
        return (
          '<article class="card stat">' +
          '<p class="stat__value">' +
          esc(stat.value || "0") +
          "</p>" +
          '<p class="stat__label">' +
          esc(stat.label || "") +
          "</p>" +
          (stat.note ? '<p class="stat__note">' + esc(stat.note) + "</p>" : "") +
          "</article>"
        );
      })
      .join("");
  }

  function linkHref(url) {
    const value = String(url || "").trim();
    if (!value) return "#";
    if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
    if (value.charAt(0) === "#" || value.charAt(0) === "/") return value;
    return "https://" + value;
  }

  function renderLinks(links) {
    const host = $("#linkGrid");
    if (!host) return;

    if (!links.length) {
      host.innerHTML =
        '<div class="emptyState"><strong>Belum ada portal.</strong>' +
        "Tambahkan lewat panel pengelola, nanti langsung muncul di sini.</div>";
      return;
    }

    host.innerHTML = links
      .map(function (link, index) {
        const featured = Boolean(link.featured);
        const href = linkHref(link.url);
        const external = /^https?:/i.test(href);
        const tag = esc(link.tag || "Umum");
        return (
          '<a class="linkCard' +
          (featured ? " is-featured" : "") +
          '" href="' +
          esc(href) +
          '"' +
          (external ? ' target="_blank" rel="noopener noreferrer"' : "") +
          ' data-reveal style="transition-delay:' +
          Math.min(index * 45, 220) +
          'ms">' +
          (featured
            ? '<span class="linkCard__flag">' +
              UI.icon("spark", 12) +
              "Pilihan</span>"
            : "") +
          '<span class="linkCard__top">' +
          '<span class="linkCard__icon">' +
          UI.icon(link.icon || "spark", 21) +
          "</span>" +
          '<span class="linkCard__tag">' +
          tag +
          "</span></span>" +
          '<h3 class="linkCard__title">' +
          esc(link.title) +
          "</h3>" +
          '<p class="linkCard__desc">' +
          esc(link.desc) +
          "</p>" +
          '<span class="linkCard__foot">' +
          (external ? "Buka ruang" : "Lihat ruang") +
          '<span class="linkCard__arrow">' +
          UI.icon("arrowUpRight", 15) +
          "</span></span></a>"
        );
      })
      .join("");

    host.querySelectorAll('a[href="#"]').forEach(function (card) {
      card.addEventListener("click", function (event) {
        event.preventDefault();
        UI.alert({
          title: "Tautan belum diatur",
          message: "Ruang ini masih kosong.",
          detail: "Admin bisa menambahkan alamat tujuannya lewat panel pengelola.",
          icon: "link"
        });
      });
    });
  }

  function renderNotes(notes) {
    const host = $("#kabarGrid");
    if (!host) return;
    if (!notes.length) {
      host.innerHTML =
        '<div class="emptyState"><strong>Belum ada kabar.</strong>Agenda dan pengumuman akan tampil di sini.</div>';
      return;
    }
    host.innerHTML = notes
      .map(function (note, index) {
        return (
          '<article class="noteCard" data-reveal style="transition-delay:' +
          Math.min(index * 60, 180) +
          'ms">' +
          '<div class="noteCard__meta"><span class="noteCard__tag">' +
          esc(note.tag || "Info") +
          "</span><span>" +
          esc(note.date ? UI.formatDate(note.date) : "") +
          "</span></div>" +
          '<h3 class="noteCard__title">' +
          esc(note.title) +
          "</h3>" +
          '<p class="noteCard__body">' +
          esc(note.body) +
          "</p>" +
          '<div class="noteCard__date">' +
          UI.icon("calendar", 14) +
          "<span>Diperbarui " +
          esc(note.date ? UI.formatDate(note.date) : "baru-baru ini") +
          "</span></div></article>"
        );
      })
      .join("");
  }

  let marqueeObserver = null;

  function watchMarquee() {
    const marquee = document.querySelector(".marquee");
    if (!marquee || marqueeObserver || !("IntersectionObserver" in window)) return;
    marqueeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle("is-running", entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    marqueeObserver.observe(marquee);
  }

  function renderMarquee(words) {
    const track = $("#marqueeTrack");
    if (!track) return;
    const items = (words && words.length ? words : ["Kolaborasi", "Karya", "Belajar"]).slice(0, 12);
    const group =
      '<div class="marquee__group">' +
      items
        .map(function (word) {
          return (
            '<span class="marquee__item"><span>' +
            esc(word) +
            "</span>" +
            UI.icon("spark", 13) +
            "</span>"
          );
        })
        .join("") +
      "</div>";
    track.innerHTML = group + group;
    watchMarquee();
  }

  function render(data) {
    renderSite(data.site);
    renderStats(data.stats);
    renderLinks(data.links);
    renderNotes(data.notes);
    renderMarquee(data.site.marquee);

    const count = data.links.length;
    const heroCount = $("#heroCount");
    if (heroCount) heroCount.textContent = count;
    const visualCount = $("#visualCount");
    if (visualCount) visualCount.textContent = count;

    hydrateIcons();
    observeReveals();
  }

  /* ---------- animasi masuk ---------- */
  let revealObserver = null;

  function observeReveals() {
    const items = document.querySelectorAll("[data-reveal]:not(.is-revealed)");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-revealed");
      });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-revealed");
            revealObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
      );
    }
    items.forEach(function (item, i) {
      if (i < 3) item.classList.add("is-revealed");
      else revealObserver.observe(item);
    });
  }

  /* ---------- nav mobile ---------- */
  function initNav() {
    const toggle = $("#navToggle");
    const nav = $("#nav");
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Buka menu navigasi");
    }

    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
      toggle.innerHTML = UI.icon(open ? "close" : "menu", 21);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      close();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });
  }

  /* ---------- tombol kembali ke atas + status ---------- */
  function initScrollUI() {
    const toTop = $("#toTop");
    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      let ticking = false;
      window.addEventListener(
        "scroll",
        function () {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(function () {
            toTop.classList.toggle("is-visible", window.scrollY > 700);
            ticking = false;
          });
        },
        { passive: true }
      );
    }
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function initConnectionUI() {
    const pill = $("#offlinePill");
    if (!pill) return;

    function sync() {
      const offline = !navigator.onLine;
      pill.classList.toggle("is-visible", offline);
    }

    window.addEventListener("online", function () {
      sync();
      UI.toast("Kamu online lagi. Semua ruang siap dibuka.", { type: "success" });
    });
    window.addEventListener("offline", function () {
      sync();
      UI.toast("Sinyal hilang. Halaman ini tetap bisa dibaca.", { type: "warn" });
    });
    sync();
  }

  /* ---------- PWA install ---------- */
  function initInstall() {
    const btn = $("#installBtn");
    const btn2 = $("#installBtn2");
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

    function showButtons(show) {
      [btn, btn2].forEach(function (node) {
        if (!node) return;
        node.hidden = !show;
      });
    }

    if (standalone) {
      showButtons(false);
    }

    window.addEventListener("beforeinstallprompt", function (event) {
      event.preventDefault();
      deferredPrompt = event;
      if (!standalone) showButtons(true);
    });

    window.addEventListener("appinstalled", function () {
      deferredPrompt = null;
      showButtons(false);
      UI.toast("Portal KiTA sudah terpasang. Cek layar utama ya.", { type: "success" });
    });

    function install() {
      if (!deferredPrompt) {
        UI.alert({
          title: "Pasang dari browser",
          message: "Browser ini belum mendukung pemasangan otomatis.",
          detail:
            "Coba menu browser → “Tambahkan ke layar utama”. Di iPhone: tombol Share → “Add to Home Screen”.",
          icon: "install",
          eyebrow: "Aplikasi"
        });
        return;
      }
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        if (choice.outcome === "accepted") {
          UI.toast("Terima kasih! Portal KiTA sedang dipasang.", { type: "success" });
        }
        deferredPrompt = null;
      });
    }

    if (btn) btn.addEventListener("click", install);
    if (btn2) btn2.addEventListener("click", install);
  }

  /* ---------- akses admin tersembunyi ---------- */
  function initAdminAccess() {
    const dot = $("#adminDot");
    if (!dot) return;
    let count = 0;
    let timer = null;
    dot.addEventListener("click", function () {
      count += 1;
      clearTimeout(timer);
      if (count === 4) {
        UI.toast("Satu ketukan lagi…", { type: "info", duration: 1400 });
      }
      if (count >= 5) {
        count = 0;
        location.href = "admin.html";
        return;
      }
      timer = setTimeout(function () {
        count = 0;
      }, 2600);
    });
  }

  /* ---------- service worker ---------- */
  function registerSW() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {
        /* halaman tetap jalan tanpa cache offline */
      });
    });
  }

  /* ---------- form usulan ---------- */
  function initSuggestionForm() {
    const form = $("#suggestionForm");
    if (!form) return;
    const state = $("#suggestionState");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const data = {
        name: (form.elements.name.value || "").trim(),
        contact: (form.elements.contact.value || "").trim(),
        portal_name: (form.elements.portal_name.value || "").trim(),
        portal_url: (form.elements.portal_url.value || "").trim(),
        message: (form.elements.message.value || "").trim()
      };
      if (!data.name || !data.portal_name || !data.portal_url) {
        UI.toast("Lengkapi nama, nama portal, dan alamat.", { type: "warn" });
        return;
      }
      const configured = window.PORTAL_SUPABASE && window.PortalBackend && window.PortalBackend.configured;
      if (!configured) {
        const subject = encodeURIComponent("Usulan portal: " + data.portal_name);
        const body = encodeURIComponent(
          "Nama: " + data.name + "\nKontak: " + data.contact + "\nPortal: " + data.portal_name + "\nURL: " + data.portal_url + "\nPesan: " + data.message
        );
        window.location.href = "mailto:halo@portalkita.id?subject=" + subject + "&body=" + body;
        if (state) state.textContent = "Membuka email...";
        return;
      }
      if (state) state.textContent = "Mengirim...";
      window.PortalBackend.submitSuggestion(data).then(function () {
        form.reset();
        if (state) state.textContent = "Terkirim. Terima kasih!";
        UI.toast("Usulan terkirim.", { type: "success" });
      }).catch(function (err) {
        if (state) state.textContent = "Gagal.";
        UI.toast((err && err.message) || "Gagal mengirim usulan.", { type: "danger" });
      });
    });
  }

  /* ---------- start ---------- */
  function start() {
    hydrateIcons();
    bootLoader();
    initNav();
    initScrollUI();
    initConnectionUI();
    initInstall();
    initAdminAccess();
    initSuggestionForm();
    registerSW();

    let first = true;
    let remoteHydration = false;
    S.subscribe(function (data) {
      if (remoteHydration) {
        render(data);
        return;
      }
      render(data);
      if (!first) {
        UI.toast("Konten diperbarui dari panel pengelola.", { type: "info" });
      }
      first = false;
    });

    render(S.read());

    function hydrateFromCloud() {
      if (!window.PORTAL_SUPABASE || !window.PortalBackend.configured) return;
      remoteHydration = true;
      // hapus toast halus saat konten dilarikan dari cloud
      window.PortalBackend.getContent().then(function (remote) {
        if (remote) S.hydrate(remote);
        remoteHydration = false;
      }).catch(function () {
        /* offline / tidak ada kredensial: tetap menggunakan yang lokal */
        remoteHydration = false;
      });
    }

    window.addEventListener("online", function () {
      hydrateFromCloud();
    });
    hydrateFromCloud();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
