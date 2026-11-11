/* Portal KiTA — komponen UI bersama: ikon custom, dialog, toast, form dialog.
 * Semua pop-up di website ini memakai komponen ini (tidak ada alert bawaan browser).
 */
(function (global) {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";

  /* ---------- ikon custom (digambar sendiri, bukan icon set standar) ---------- */
  const ICONS = {
    spark:
      '<path d="M12 2.6c.7 4.7 2.5 6.5 7.2 7.2-4.7.7-6.5 2.5-7.2 7.2-.7-4.7-2.5-6.5-7.2-7.2 4.7-.7 6.5-2.5 7.2-7.2Z"/><circle cx="19.3" cy="18.8" r="1.4"/>',
    orbit:
      '<circle cx="12" cy="12" r="3.1"/><ellipse cx="12" cy="12" rx="9.4" ry="4.5" transform="rotate(-24 12 12)"/><circle cx="19.4" cy="6.3" r="1.3"/>',
    wave: '<path d="M2.5 14.2c2.6-6.4 5.2-6.4 7.8 0s5.2 6.4 7.8 0"/><path d="M2.5 18.6h9" opacity=".45"/>',
    prism: '<path d="M12 3.4 21 19.6H3Z"/><path d="M12 3.4v16.2"/><circle cx="16.4" cy="12.2" r="1"/>',
    leaf:
      '<path d="M20.4 4.2C9.5 4.2 4 9.2 4 15.8c0 2.1.7 3.7.7 3.7s1.6-.6 3.6-2c3.5 3.3 9.4 1.3 11.5-4.6 1-3 1-6.3.6-8.7Z"/><path d="M6.2 18.4C8.7 12 12.7 9 17.2 7.4"/>',
    bolt: '<path d="M13.2 2.4 5 13.6h5.3L9.9 21.6 19 9.4h-5.6Z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.7 8.4-2.1 5.3-5.3 2 2.1-5.3Z"/>',
    chat:
      '<path d="M4 6.6A3.6 3.6 0 0 1 7.6 3h8.8A3.6 3.6 0 0 1 20 6.6v5.8a3.6 3.6 0 0 1-3.6 3.6H11l-4.6 4v-4h-.4A3.6 3.6 0 0 1 4 12.4Z"/><path d="M8.3 8.2h7.4M8.3 11.3h4.2"/>',
    music:
      '<path d="M9 18.1V6.3l9-2.3v11.4"/><ellipse cx="6.4" cy="18.2" rx="2.6" ry="2.2"/><ellipse cx="15.4" cy="15.4" rx="2.6" ry="2.2"/>',
    code: '<path d="m8.4 8.4-4.1 3.6 4.1 3.6M15.6 8.4l4.1 3.6-4.1 3.6M13.4 5.4l-2.8 13.2"/>',
    book:
      '<path d="M4 5.6A2.6 2.6 0 0 1 6.6 3H19v15.4H6.6A2.6 2.6 0 0 0 4 21Z"/><path d="M4 18.4V5.6M8 7.2h7M8 10.6h7"/>',
    pen: '<path d="M20 4.7a2.9 2.9 0 0 0-4.1 0L5.1 15.5 3.4 21l5.6-1.7L20 8.8a2.9 2.9 0 0 0 0-4.1Z"/><path d="m14.9 5.7 3.4 3.4"/>',
    globe:
      '<circle cx="12" cy="12" r="9"/><path d="M3.2 9.4h17.6M3.2 14.6h17.6"/><path d="M12 3c2.6 2.7 4 5.7 4 9s-1.4 6.3-4 9c-2.6-2.7-4-5.7-4-9s1.4-6.3 4-9Z"/>',
    heart:
      '<path d="M12 20.5S3.5 15 3.5 9.4A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.5 2.4c0 5.6-8.5 11.1-8.5 11.1Z"/>',
    calendar:
      '<rect x="3.5" y="5" width="17" height="15.5" rx="3.2"/><path d="M8 3v4M16 3v4M3.5 10h17M8 14h2M13.8 14h2M8 17.3h2"/>',
    camera:
      '<path d="M4 8.4h3l1.6-2.3h6.8L17 8.4h3a1.5 1.5 0 0 1 1.5 1.5V18A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V9.9A1.5 1.5 0 0 1 4 8.4Z"/><circle cx="12" cy="13.6" r="3.4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    terminal:
      '<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="m7.4 9.4 3 2.8-3 2.8M12.6 15h4"/>',
    grid:
      '<rect x="4" y="4" width="6.6" height="6.6" rx="2"/><rect x="13.4" y="4" width="6.6" height="6.6" rx="2"/><rect x="4" y="13.4" width="6.6" height="6.6" rx="2"/><rect x="13.4" y="13.4" width="6.6" height="6.6" rx="2"/>',
    coffee:
      '<path d="M4.5 8h12v6.5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Z"/><path d="M16.5 9.4h1.6a2.6 2.6 0 0 1 0 5.2h-1.6M3.5 22h14"/><path d="M8 3.2c-.8 1.2-.8 1.8 0 3M12 3.2c-.8 1.2-.8 1.8 0 3"/>',
    arrowRight: '<path d="M4 12h15M13.6 6.4 19.4 12l-5.8 5.6"/>',
    arrowUpRight: '<path d="M6.8 17.2 17.2 6.8M8.8 6.8h8.4v8.4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M4 20h4.2L19.4 8.8a2.4 2.4 0 0 0-3.4-3.4L4.8 16.6 4 20Z"/><path d="m14.6 6.8 3.4 3.4"/>',
    trash:
      '<path d="M4 7h16M9.6 7V4.4h4.8V7M6.6 7l.9 12.1a2 2 0 0 0 2 1.9h5a2 2 0 0 0 2-1.9L17.4 7"/><path d="M10.2 11v6M13.8 11v6"/>',
    up: '<path d="M12 19V5M6.6 10.4 12 5l5.4 5.4"/>',
    down: '<path d="M12 5v14M6.6 13.6 12 19l5.4-5.4"/>',
    close: '<path d="m6.4 6.4 11.2 11.2M17.6 6.4 6.4 17.6"/>',
    check: '<path d="m4.6 12.6 4.8 4.8L19.6 6.8"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.7"/><path d="m15.8 15.8 4.6 4.6"/>',
    menu: '<path d="M4 8.5h11M9.5 15.5H20"/>',
    offline: '<circle cx="12" cy="12" r="8.6"/><path d="M6.2 17.8 17.8 6.2"/>',
    online: '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/>',
    download: '<path d="M12 3.6v10.8M7.6 10 12 14.4 16.4 10"/><path d="M4.5 16.8v2.7h15v-2.7"/>',
    upload: '<path d="M12 14.4V3.6M7.6 8 12 3.6 16.4 8"/><path d="M4.5 16.8v2.7h15v-2.7"/>',
    refresh: '<path d="M19.6 12a7.6 7.6 0 1 1-2.3-5.4"/><path d="M19.6 4.4v4.4h-4.4"/>',
    link: '<path d="M10.4 13.6a4.1 4.1 0 0 0 5.8 0l2.7-2.7a4.1 4.1 0 0 0-5.8-5.8L11.7 6.5"/><path d="M13.6 10.4a4.1 4.1 0 0 0-5.8 0L5.1 13.1a4.1 4.1 0 0 0 5.8 5.8l1.4-1.4"/>',
    shield: '<path d="M12 3 5 5.8v5.4c0 4.1 3 7.4 7 9.8 4-2.4 7-5.7 7-9.8V5.8Z"/><path d="m9 11.8 2.2 2.2 3.9-4.2"/>',
    eye: '<path d="M2.8 12S6 6.4 12 6.4 21.2 12 21.2 12 18 17.6 12 17.6 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.9"/>',
    install: '<path d="M12 3.6v10M8.4 10 12 13.6 15.6 10"/><path d="M4.6 15.4v3.2A1.6 1.6 0 0 0 6.2 20.2h11.6a1.6 1.6 0 0 0 1.6-1.6v-3.2"/>',
    save: '<path d="M5 3.8h11l3.2 3.2v13.2H5Z"/><path d="M8.4 3.8v5.4h6.2V3.8M8.4 20.2v-6.4h7.2v6.4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".9" fill="currentColor" stroke="none"/>',
    alert: '<path d="M12 3.4 21 20H3Z"/><path d="M12 9.4v4.8"/><circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none"/>',
    logout: '<path d="M9.5 4.5h-3A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5h3"/><path d="M14 7.8 18.2 12 14 16.2M18 12H8.6"/>',
    sparkWand:
      '<path d="M5 19 15.5 8.5M14 4.2l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9Z"/><path d="M6.8 4.5l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5Z"/>'
  };

  const ICON_LABELS = {
    spark: "Kilau",
    orbit: "Orbit",
    wave: "Gelombang",
    prism: "Prisma",
    leaf: "Daun",
    bolt: "Petir",
    compass: "Kompas",
    chat: "Obrolan",
    music: "Musik",
    code: "Kode",
    book: "Buku",
    pen: "Pena",
    globe: "Bola dunia",
    heart: "Hati",
    calendar: "Kalender",
    camera: "Kamera",
    target: "Target",
    terminal: "Terminal",
    grid: "Kisi",
    coffee: "Kopi"
  };

  const ICON_NAMES = Object.keys(ICON_LABELS);

  function icon(name, size) {
    const path = ICONS[name] || ICONS.spark;
    const px = size || 24;
    return (
      '<svg class="ui-icon" viewBox="0 0 24 24" width="' +
      px +
      '" height="' +
      px +
      '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      path +
      "</svg>"
    );
  }

  function mark(size) {
    const px = size || 40;
    return (
      '<svg class="brand-svg" viewBox="0 0 64 64" width="' +
      px +
      '" height="' +
      px +
      '" role="img" aria-label="Portal KiTA">' +
      '<defs><linearGradient id="pkgrad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#ffd6a5"/><stop offset=".5" stop-color="#ffa23a"/>' +
      '<stop offset="1" stop-color="#ff6b5b"/></linearGradient></defs>' +
      '<circle cx="32" cy="32" r="27" fill="none" stroke="url(#pkgrad)" stroke-width="2.5" opacity=".85"/>' +
      '<circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".28"/>' +
      '<g stroke="currentColor" stroke-width="5.4" stroke-linecap="round" fill="none">' +
      '<path d="M24.5 21v22"/><path d="M27.5 32 41 19.5"/><path d="M27.5 32 42 45"/></g>' +
      '<circle cx="46.5" cy="17.5" r="2.6" fill="#ffd6a5"/>' +
      "</svg>"
    );
  }

  /* ---------- util ---------- */
  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    if (isNaN(date.getTime())) return String(iso);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  /* ---------- toast ---------- */
  let toastStack = null;

  function toast(message, options) {
    const opts = options || {};
    const type = opts.type || "info";
    if (!toastStack) {
      toastStack = el("div", "ui-toasts");
      toastStack.setAttribute("role", "status");
      toastStack.setAttribute("aria-live", "polite");
      document.body.appendChild(toastStack);
    }
    const iconName =
      type === "success" ? "check" : type === "error" ? "alert" : type === "warn" ? "offline" : "info";
    const node = el(
      "div",
      "ui-toast ui-toast--" + type,
      '<span class="ui-toast__icon">' +
        icon(iconName, 18) +
        "</span>" +
        '<p class="ui-toast__text"></p>' +
        '<button class="ui-toast__close" type="button" aria-label="Tutup notifikasi">' +
        icon("close", 15) +
        "</button>"
    );
    node.querySelector(".ui-toast__text").textContent = message;
    node.querySelector(".ui-toast__close").addEventListener("click", function () {
      dismiss();
    });
    toastStack.appendChild(node);
    requestAnimationFrame(function () {
      node.classList.add("is-in");
    });

    let timer = setTimeout(dismiss, opts.duration || 4200);
    function dismiss() {
      clearTimeout(timer);
      node.classList.remove("is-in");
      node.classList.add("is-out");
      setTimeout(function () {
        node.remove();
      }, 260);
    }
    return dismiss;
  }

  /* ---------- dialog ---------- */
  let activeDialog = null;
  let lastFocus = null;

  function focusables(root) {
    return Array.prototype.slice
      .call(
        root.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      .filter(function (node) {
        return node.offsetParent !== null;
      });
  }

  function closeTopDialog(value) {
    if (activeDialog) activeDialog.close(value);
  }

  function openDialog(options) {
    if (activeDialog) activeDialog.close(null);

    lastFocus = document.activeElement;
    const dialog = el("div", "ui-layer");
    dialog.innerHTML =
      '<div class="ui-backdrop" data-backdrop></div>' +
      '<div class="ui-dialog ' +
      (options.size === "lg" ? "ui-dialog--lg" : "") +
      '" role="dialog" aria-modal="true" aria-labelledby="ui-dialog-title">' +
      '<div class="ui-dialog__glow" aria-hidden="true"></div>' +
      '<header class="ui-dialog__head">' +
      '<div class="ui-dialog__heading">' +
      (options.eyebrow
        ? '<p class="ui-dialog__eyebrow">' + escapeHTML(options.eyebrow) + "</p>"
        : "") +
      '<h2 class="ui-dialog__title" id="ui-dialog-title"></h2>' +
      (options.desc ? '<p class="ui-dialog__desc"></p>' : "") +
      "</div>" +
      '<button class="ui-dialog__close" type="button" aria-label="Tutup dialog">' +
      icon("close", 18) +
      "</button>" +
      "</header>" +
      '<div class="ui-dialog__body"></div>' +
      '<footer class="ui-dialog__foot"></footer>' +
      "</div>";

    dialog.querySelector(".ui-dialog__title").textContent = options.title || "";
    if (options.desc) dialog.querySelector(".ui-dialog__desc").textContent = options.desc;

    const body = dialog.querySelector(".ui-dialog__body");
    if (typeof options.content === "string") body.innerHTML = options.content;
    else if (options.content) body.appendChild(options.content);

    const foot = dialog.querySelector(".ui-dialog__foot");
    const actions = options.actions || [{ label: "Tutup", value: null }];

    document.body.appendChild(dialog);
    document.body.classList.add("ui-locked");

    let settled = false;
    function close(value) {
      if (settled) return;
      settled = true;
      document.removeEventListener("keydown", onKey, true);
      dialog.classList.add("is-closing");
      const box = dialog.querySelector(".ui-dialog");
      if (box) box.classList.add("is-closing");
      setTimeout(function () {
        dialog.remove();
        document.body.classList.remove("ui-locked");
        if (activeDialog && activeDialog.node === dialog) activeDialog = null;
        if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
      }, 200);
      resolve(value);
    }

    let resolve;
    const promise = new Promise(function (res) {
      resolve = res;
    });

    actions.forEach(function (action) {
      const btn = document.createElement("button");
      btn.type = action.submit ? "submit" : "button";
      btn.className =
        "btn btn--" + (action.variant || "ghost") + (action.wide ? " btn--wide" : "");
      if (action.form) btn.setAttribute("form", action.form);
      btn.innerHTML =
        (action.icon ? icon(action.icon, 17) : "") +
        "<span>" +
        escapeHTML(action.label) +
        "</span>";
      btn.addEventListener("click", function () {
        if (typeof action.onClick === "function") {
          const result = action.onClick(body, close);
          if (result === false) return;
          if (result instanceof Promise) {
            result.then(function (val) {
              if (val !== false) close(val === undefined ? action.value : val);
            });
            return;
          }
          if (result !== undefined) {
            close(result);
            return;
          }
        }
        if (!action.keepOpen) close(action.value === undefined ? action.label : action.value);
      });
      foot.appendChild(btn);
    });

    dialog.querySelector(".ui-dialog__close").addEventListener("click", function () {
      close(null);
    });
    dialog.querySelector("[data-backdrop]").addEventListener("click", function () {
      close(null);
    });

    function onKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close(null);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables(dialog);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey, true);

    activeDialog = { node: dialog, close: close };
    requestAnimationFrame(function () {
      dialog.classList.add("is-open");
      if (options.onMount) options.onMount(body, close);
      const autofocus = body.querySelector("[autofocus]") || focusables(dialog).find(function (n) {
        return n.closest(".ui-dialog__foot") === null && n.tagName !== "BUTTON";
      });
      if (autofocus) autofocus.focus();
      else dialog.querySelector(".ui-dialog__close").focus();
    });

    return promise;
  }

  function alertBox(options) {
    const opts = typeof options === "string" ? { message: options } : options || {};
    return openDialog({
      title: opts.title || "Info",
      desc: opts.message || "",
      eyebrow: opts.eyebrow || "",
      content:
        '<div class="ui-state">' +
        '<span class="ui-state__icon ui-state__icon--' +
        (opts.tone || "info") +
        '">' +
        icon(opts.icon || "info", 26) +
        "</span>" +
        '<p class="ui-state__text">' +
        escapeHTML(opts.detail || "") +
        "</p></div>",
      actions: [{ label: opts.confirmLabel || "Mengerti", variant: "primary", icon: "check", value: true }]
    });
  }

  function confirmBox(options) {
    const opts = options || {};
    return openDialog({
      title: opts.title || "Lanjutkan?",
      eyebrow: opts.eyebrow || "Konfirmasi",
      content:
        '<div class="ui-state ui-state--row">' +
        '<span class="ui-state__icon ui-state__icon--' +
        (opts.danger ? "danger" : "info") +
        '">' +
        icon(opts.icon || (opts.danger ? "trash" : "info"), 26) +
        "</span>" +
        '<p class="ui-state__text">' +
        escapeHTML(opts.message || "") +
        "</p></div>",
      actions: [
        { label: opts.cancelLabel || "Batal", variant: "ghost", value: false },
        {
          label: opts.confirmLabel || "Ya, lanjut",
          variant: opts.danger ? "danger" : "primary",
          value: true
        }
      ]
    }).then(function (value) {
      return value === true;
    });
  }

  function promptBox(options) {
    const opts = options || {};
    const wrap = el("div", "ui-form");
    wrap.innerHTML =
      '<label class="ui-field">' +
      '<span class="ui-field__label"></span>' +
      (opts.multiline
        ? '<textarea class="ui-input" rows="4"></textarea>'
        : '<input class="ui-input" type="text" />') +
      '<span class="ui-field__error" role="alert"></span>' +
      "</label>";
    wrap.querySelector(".ui-field__label").textContent = opts.label || "Isi";
    const input = wrap.querySelector(".ui-input");
    input.value = opts.value || "";
    input.placeholder = opts.placeholder || "";

    return openDialog({
      title: opts.title || "Isi data",
      desc: opts.desc || "",
      content: wrap,
      actions: [
        { label: "Batal", variant: "ghost", value: null },
        {
          label: opts.confirmLabel || "Simpan",
          variant: "primary",
          icon: "check",
          onClick: function () {
            const value = input.value.trim();
            if (opts.required && !value) {
              const error = wrap.querySelector(".ui-field__error");
              error.textContent = "Bagian ini belum diisi.";
              input.classList.add("is-invalid");
              input.focus();
              return false;
            }
            return value;
          }
        }
      ]
    });
  }

  /* form dialog: mengembalikan object nilai, atau null kalau dibatalkan */
  function formDialog(options) {
    const opts = options || {};
    const fields = opts.fields || [];
    const values = opts.values || {};
    const form = el("form", "ui-form");
    form.setAttribute("novalidate", "novalidate");

    fields.forEach(function (field) {
      const id = "f-" + field.name;
      const initial = values[field.name];
      const value = initial == null ? field.value || "" : initial;
      const wrap = el("div", "ui-field" + (field.full ? " ui-field--full" : ""));
      let control = "";

      if (field.type === "textarea") {
        control =
          '<textarea class="ui-input" id="' +
          id +
          '" name="' +
          field.name +
          '" rows="' +
          (field.rows || 3) +
          '" placeholder="' +
          escapeHTML(field.placeholder || "") +
          '"></textarea>';
      } else if (field.type === "select") {
        control =
          '<select class="ui-input" id="' +
          id +
          '" name="' +
          field.name +
          '">' +
          (field.options || [])
            .map(function (opt) {
              return (
                '<option value="' +
                escapeHTML(opt.value) +
                '">' +
                escapeHTML(opt.label) +
                "</option>"
              );
            })
            .join("") +
          "</select>";
      } else if (field.type === "checkbox") {
        control =
          '<label class="ui-switch" for="' +
          id +
          '"><input type="checkbox" id="' +
          id +
          '" name="' +
          field.name +
          '" /><span class="ui-switch__track"><i></i></span><span class="ui-switch__label">' +
          escapeHTML(field.checkboxLabel || "Aktifkan") +
          "</span></label>";
      } else if (field.type === "icons") {
        const selectedIcon = value || "spark";
        control =
          '<input type="hidden" name="' +
          field.name +
          '" value="' +
          escapeHTML(selectedIcon) +
          '" />' +
          '<div class="ui-iconpick" role="group" aria-label="' +
          escapeHTML(field.label || "Pilih ikon") +
          '">' +
          ICON_NAMES.map(function (name) {
            return (
              '<button type="button" class="ui-iconpick__btn' +
              (name === selectedIcon ? " is-active" : "") +
              '" data-icon-value="' +
              name +
              '" aria-label="' +
              escapeHTML(ICON_LABELS[name] || name) +
              '" aria-pressed="' +
              (name === selectedIcon ? "true" : "false") +
              '">' +
              icon(name, 20) +
              "</button>"
            );
          }).join("") +
          "</div>";
      } else if (field.type === "swatches") {
        const selectedAccent = value || (field.options && field.options[0] ? field.options[0].value : "sun");
        control =
          '<input type="hidden" name="' +
          field.name +
          '" value="' +
          escapeHTML(selectedAccent) +
          '" />' +
          '<div class="ui-swatches" role="group" aria-label="' +
          escapeHTML(field.label || "Pilih warna") +
          '">' +
          (field.options || [])
            .map(function (opt) {
              return (
                '<button type="button" class="ui-swatch ui-swatch--' +
                escapeHTML(opt.value) +
                (opt.value === selectedAccent ? " is-active" : "") +
                '" data-swatch-value="' +
                escapeHTML(opt.value) +
                '" aria-label="' +
                escapeHTML(opt.label) +
                '" aria-pressed="' +
                (opt.value === selectedAccent ? "true" : "false") +
                '"><span></span></button>'
              );
            })
            .join("") +
          "</div>";
      } else {
        control =
          '<input class="ui-input" id="' +
          id +
          '" name="' +
          field.name +
          '" type="' +
          (field.type || "text") +
          '" placeholder="' +
          escapeHTML(field.placeholder || "") +
          '" autocomplete="off" ' +
          (field.maxLength ? 'maxlength="' + field.maxLength + '"' : "") +
          " />";
      }

      wrap.innerHTML =
        (field.type === "checkbox"
          ? ""
          : '<label class="ui-field__label" for="' + id + '">' + escapeHTML(field.label || field.name) + "</label>") +
        control +
        (field.hint ? '<p class="ui-field__hint">' + escapeHTML(field.hint) + "</p>" : "") +
        '<p class="ui-field__error" role="alert"></p>';

      // isi nilai awal
      const input = wrap.querySelector('[name="' + field.name + '"]');
      if (field.type === "checkbox") input.checked = Boolean(value);
      else input.value = value;

      if (field.type === "icons") {
        wrap.querySelectorAll(".ui-iconpick__btn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            input.value = btn.getAttribute("data-icon-value");
            wrap.querySelectorAll(".ui-iconpick__btn").forEach(function (other) {
              const active = other === btn;
              other.classList.toggle("is-active", active);
              other.setAttribute("aria-pressed", active ? "true" : "false");
            });
          });
        });
      }

      if (field.type === "swatches") {
        wrap.querySelectorAll(".ui-swatch").forEach(function (btn) {
          btn.addEventListener("click", function () {
            input.value = btn.getAttribute("data-swatch-value");
            wrap.querySelectorAll(".ui-swatch").forEach(function (other) {
              const active = other === btn;
              other.classList.toggle("is-active", active);
              other.setAttribute("aria-pressed", active ? "true" : "false");
            });
          });
        });
      }

      form.appendChild(wrap);
    });

    if (opts.note) {
      form.insertAdjacentHTML(
        "beforeend",
        '<p class="ui-form__note">' + icon("info", 16) + "<span>" + escapeHTML(opts.note) + "</span></p>"
      );
    }

    // Enter mengirim form (kecuali di textarea), sama seperti klik Simpan
    form.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" || event.shiftKey || event.target.tagName === "TEXTAREA") return;
      event.preventDefault();
      const primary = document.querySelector(".ui-dialog__foot .btn--primary");
      if (primary) primary.click();
    });

    return openDialog({
      title: opts.title || "Tambah data",
      desc: opts.desc || "",
      eyebrow: opts.eyebrow || "",
      size: opts.size || "md",
      content: form,
      actions: [
        { label: "Batal", variant: "ghost", value: null },
        {
          label: opts.submitLabel || "Simpan",
          variant: "primary",
          icon: "save",
          onClick: function () {
            const result = {};
            let firstInvalid = null;
            let valid = true;
            form.querySelectorAll(".ui-field").forEach(function (fieldEl) {
              fieldEl.classList.remove("has-error");
              const err = fieldEl.querySelector(".ui-field__error");
              if (err) err.textContent = "";
            });

            fields.forEach(function (field) {
              const input = form.querySelector('[name="' + field.name + '"]');
              let val;
              if (field.type === "checkbox") val = input.checked;
              else val = input.value.trim();
              result[field.name] = val;

              if (field.type !== "checkbox" && field.required && !val) {
                valid = false;
                markError(input, "Wajib diisi.");
              } else if (val && field.validate && !field.validate(val)) {
                valid = false;
                markError(input, field.errorText || "Format belum sesuai.");
              } else if (
                field.type === "url" &&
                val &&
                !/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(val)
              ) {
                valid = false;
                markError(input, "Gunakan alamat lengkap, mis. https://contoh.id");
              }
            });

            function markError(input, text) {
              const fieldEl = input.closest(".ui-field");
              fieldEl.classList.add("has-error");
              const err = fieldEl.querySelector(".ui-field__error");
              if (err) err.textContent = text;
              if (!firstInvalid) firstInvalid = input;
            }

            if (!valid) {
              if (firstInvalid) firstInvalid.focus();
              return false;
            }
            return result;
          }
        }
      ]
    });
  }

  global.PortalUI = {
    icon: icon,
    icons: ICON_NAMES,
    iconLabel: function (name) {
      return ICON_LABELS[name] || name;
    },
    mark: mark,
    escapeHTML: escapeHTML,
    formatDate: formatDate,
    toast: toast,
    dialog: openDialog,
    alert: alertBox,
    confirm: confirmBox,
    prompt: promptBox,
    formDialog: formDialog
  };

  // kompatibilitas: pakai juga sebagai `ui` di halaman
  global.ui = global.PortalUI;
})(window);
