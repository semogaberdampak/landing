/* Portal KiTA — lapisan Supabase berbasis REST (tanpa SDK).
 * Kolom-kolom pasti ada di supabase/schema.sql.
 * Tanpa URL/anonKey, seluruh mekanisme supaya gak ikut memakan jaringan.
 */
(function (global) {
  "use strict";

  const CFG = global.PORTAL_SUPABASE || {};
  const BASE = String(CFG.url || "").replace(/\/+$/, "");
  const ANON_KEY = String(CFG.anonKey || "").trim();
  const CONFIGURED = /^https?:\/\//.test(BASE) && ANON_KEY.length > 30;
  const AUTH_KEY = "portal-kita:auth:v1";
  const SESSION = "portal-kita:session:v1";
  const DIRTY = "portal-kita:dirty:v1";
  const CONTENT_ROW = "singleton";

  const TIMEOUT = 12000;

  function storageGet(key, fallback) {
    try {
      const raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  function storageRemove(key) {
    try {
      global.localStorage.removeItem(key);
      return true;
    } catch (err) {
      return false;
    }
  }

  function info(msg) {
    return { message: msg, kind: "info" };
  }

  function authError(message) {
    return Object.assign(new Error(message), { kind: "auth", status: 401 });
  }

  function transportError(message, status) {
    return Object.assign(new Error(message), { kind: "transport", status: status });
  }

  function offlineError(message) {
    return Object.assign(new Error(message), { kind: "offline", status: 0 });
  }

  function withTimeout(promise, ms) {
    let timer;
    return new Promise(function (resolve, reject) {
      const controller = new AbortController();
      timer = setTimeout(function () {
        controller.abort();
      }, ms);
      promise
        .then(function (value) {
          clearTimeout(timer);
          resolve(value);
        })
        .catch(function (err) {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  function fetchJson(path, options) {
    const { method = "GET", body, headers: extra = {}, token } = options || {};
    const headers = Object.assign(
      {
        Accept: "application/json",
        apikey: ANON_KEY,
        "Content-Type": "application/json",
        "x-ui": "portal-kita",
        "x-client-version": "portal-kita-static"
      },
      extra || {}
    );
    if (token) headers.Authorization = "Bearer " + token;
    return withTimeout(
      fetch(BASE + path, {
        method: method,
        headers: headers,
        body: body ? JSON.stringify(body) : undefined
      }).then(function (res) {
        if (!res.ok) {
          return res.text().then(function (text) {
            let detail = text || "Permintaan gagal " + res.status;
            try {
              const parsed = JSON.parse(text);
              if (parsed.message) detail = parsed.message;
              if (parsed.error_description) detail = parsed.error_description;
              if (parsed.msg) detail = parsed.msg;
            } catch (err) {
              /* bukan json */
            }
            const error = transportError(detail, res.status);
            error.status = res.status;
            throw error;
          }).catch(function () {
            const error = transportError("Permintaan gagal " + res.status, res.status);
            error.status = res.status;
            throw error;
          });
        }
        return res.text();
      }).then(function (text) {
        if (!text) return null;
        try {
          return JSON.parse(text);
        } catch (err) {
          return text;
        }
      }),
      TIMEOUT
    );
  }

  function request(path, options) {
    return withTimeout(fetchJson(path, options), TIMEOUT);
  }

  function readSession() {
    return storageGet(AUTH_KEY, null);
  }

  function writeSession(session) {
    if (session) storageSet(AUTH_KEY, session);
    else storageRemove(AUTH_KEY);
  }

  function clearSession() {
    writeSession(null);
    storageRemove(DIRTY);
  }

  function isExpired(session) {
    if (!session || !session.expires_at) return true;
    return session.expires_at - Date.now() <= 60 * 1000;
  }

  function upsertSession(raw) {
    const expiresAt = Date.now() + (raw.expires_in || 3600) * 1000;
    return {
      access_token: raw.access_token,
      refresh_token: raw.refresh_token,
      expires_at: expiresAt,
      email: raw.email || null,
      last_seen: new Date().toISOString()
    };
  }

  function refreshSession(refreshToken) {
    return request("/auth/v1/token?" + new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    }), {
      method: "POST",
      headers: { apikey: ANON_KEY, "Content-Type": "application/json" }
    })
      .then(function (data) {
        return upsertSession(data);
      })
      .catch(function (err) {
        if (err && err.status === 400) {
          return Promise.reject(authError("Token authinya sudah tidak berlaku. Silakan login ulang."));
        }
        return Promise.reject(info("Gagal me-refresh sesi."));
      });
  }

  async function accessToken() {
    const session = readSession();
    if (!session) return null;
    if (!isExpired(session)) return session.access_token;

    try {
      const refreshed = await refreshSession(session.refresh_token);
      writeSession(refreshed);
      return refreshed.access_token;
    } catch (err) {
      clearSession();
      return null;
    }
  }

  async function firstToken() {
    let token = await accessToken();
    if (token) return token;
    const session = readSession();
    if (session && !session.refresh_token) return null;
    try {
      const res = await request("/auth/v1/token?" + new URLSearchParams({
        grant_type: "password",
        email: session ? session.email : "",
        password: ""
      }), {
        method: "POST",
        headers: { apikey: ANON_KEY }
      });
      const next = upsertSession(res);
      writeSession(next);
      return next.access_token;
    } catch (err) {
      return null;
    }
  }

  async function signIn(email, password) {
    const res = await request("/auth/v1/token?" + new URLSearchParams({
      grant_type: "password",
      email: email,
      password: password
    }), {
      method: "POST",
      headers: { apikey: ANON_KEY, "Content-Type": "application/json" }
    });
    const session = upsertSession(res);
    writeSession(session);
    storageSet(DIRTY, false);
    return { email: session.email };
  }

  function signOut() {
    clearSession();
    return Promise.resolve({ success: true });
  }

  function loggedIn() {
    return accessToken().then(function (token) {
      return !!token;
    }).catch(function () {
      return false;
    });
  }

  function contentPath() {
    return "/rest/v1/portal_content?on_conflict=id";
  }

  function contentReadPath() {
    return "/rest/v1/portal_content?id=eq.singleton&select=data,updated_at";
  }

  async function getContent() {
    const token = await firstToken();
    const data = await request(contentReadPath(), {
      method: "GET",
      token: token
    });
    if (!Array.isArray(data) || data.length === 0) return null;
    const row = data[0];
    if (typeof row.data !== "object" || row.data === null) return {};
    return row.data;
  }

  async function saveContent(data) {
    const token = await firstToken();
    const options = {
      method: "POST",
      token: token,
      body: {
        id: CONTENT_ROW,
        data: data,
        updated_at: new Date().toISOString()
      }
    };

    const res = await request(contentPath(), options).catch(function (err) {
      if (err && err.status === 401) {
        return firstToken().then(function (next) {
          if (!next) throw err;
          return request(contentPath(), Object.assign({}, options, { token: next }));
        });
      }
      throw err;
    });
    return res;
  }

  async function markDirty(force) {
    if (force === false) {
      storageRemove(DIRTY);
      return;
    }
    const value = storageGet(DIRTY, false);
    storageSet(DIRTY, value === false ? true : value);
  }

  function isDirty() {
    return storageGet(DIRTY, false) === true;
  }

  function submissionPath() {
    return "/rest/v1/submissions";
  }

  async function submitSuggestion(payload) {
    const token = await firstToken();
    const res = await request(submissionPath(), {
      method: "POST",
      token: token,
      body: Object.assign(
        {
          name: String(payload.name || "").trim().slice(0, 80),
          contact: String(payload.contact || "").trim().slice(0, 200),
          portal_name: String(payload.portal_name || "").trim().slice(0, 80),
          portal_url: String(payload.portal_url || "").trim().slice(0, 500),
          message: String(payload.message || "").trim().slice(0, 1000)
        },
        token ? { created_by: token } : {}
      )
    });
    return res;
  }

  function listSubmissionsPath() {
    return "/rest/v1/submissions?select=id,name,contact,portal_name,portal_url,message,created_at&order=created_at.desc&limit=200";
  }

  async function getSubmissions() {
    const token = await firstToken();
    const data = await request(listSubmissionsPath(), { method: "GET", token: token });
    return Array.isArray(data) ? data : [];
  }

  async function deleteSubmission(id) {
    const token = await firstToken();
    return request(submissionPath() + "?id=eq." + encodeURIComponent(String(id)), {
      method: "DELETE",
      token: token
    });
  }

  global.PortalBackend = {
    configured: CONFIGURED,
    base: BASE,
    ANON_KEY: ANON_KEY,
    signIn: signIn,
    signOut: signOut,
    loggedIn: loggedIn,
    getContent: getContent,
    saveContent: saveContent,
    markDirty: markDirty,
    isDirty: isDirty,
    submitSuggestion: submitSuggestion,
    getSubmissions: getSubmissions,
    deleteSubmission: deleteSubmission,
    clearSession: clearSession,
    readSession: readSession,
    writeSession: writeSession,
    STORAGE_SESSION: AUTH_KEY
  };
})(window);
