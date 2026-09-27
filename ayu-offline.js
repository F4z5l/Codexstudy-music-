(function () {
  var DB = "ayu-downloads", STORE = "songs";
  function db() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(STORE, { keyPath: "id" }); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction(STORE, mode), q = fn(t.objectStore(STORE));
        t.oncomplete = function () { res(q && q.result); };
        t.onerror = function () { rej(t.error); };
      });
    });
  }
  window.ayuDownloads = {
    all: function () { return tx("readonly", function (s) { return s.getAll(); }); },
    remove: function (id) { return tx("readwrite", function (s) { return s.delete(id); }); },
  };

  function toast(msg) {
    var el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText = "position:fixed;left:50%;bottom:110px;transform:translateX(-50%);z-index:99999;background:#111;color:#fff;border:1px solid #333;padding:10px 18px;border-radius:999px;font:600 12px system-ui;letter-spacing:.05em;box-shadow:0 8px 30px rgba(0,0,0,.5)";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
    return el;
  }

  window.__ayuSave = function (song, url) {
    var imgs = song.image || [], img = imgs.length ? imgs[imgs.length - 1].url || imgs[imgs.length - 1].link : "";
    var artist = (song.artists && song.artists.primary && song.artists.primary[0] && song.artists.primary[0].name) || "Unknown";
    var t = toast("Downloading… " + song.name);
    Promise.all([
      fetch(url).then(function (r) { if (!r.ok) throw 0; return r.blob(); }),
      img ? fetch(img).then(function (r) { return r.blob(); }).catch(function () { return null; }) : null,
    ]).then(function (b) {
      return tx("readwrite", function (s) {
        return s.put({ id: String(song.id || url), name: song.name, artist: artist, duration: song.duration || 0, audio: b[0], cover: b[1], savedAt: Date.now() });
      });
    }).then(function () { t.remove(); toast("Saved to Library → Downloads"); })
      .catch(function () { t.remove(); toast("Download failed. Try again."); });
  };

  // "Downloads" shortcut on the Library page
  function addLibraryButton() {
    if (location.pathname.indexOf("/library") !== 0 || document.getElementById("ayu-dl-btn")) return;
    var a = document.createElement("a");
    a.id = "ayu-dl-btn"; a.href = "/downloads";
    a.innerHTML = "&#8595;&nbsp; Downloads";
    a.style.cssText = "position:fixed;top:16px;right:16px;z-index:9999;background:#fff;color:#000;text-decoration:none;padding:10px 16px;border-radius:999px;font:800 11px system-ui;letter-spacing:.15em;text-transform:uppercase;box-shadow:0 6px 24px rgba(0,0,0,.4)";
    document.body.appendChild(a);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addLibraryButton); else addLibraryButton();

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/ayu-sw.js").catch(function () {});
})();
