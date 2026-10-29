// Compteur de téléchargements : additionne download_count de toutes les releases GitHub.
// En cas d'échec de l'API (limite de 60 requêtes/heure), on reprend la dernière valeur connue.
const REPO = "djbenjaminfranklin-sketch/benjamin-franklin-plugins-site";
const CACHE_KEY = "bf-counts";
const PLUGINS = { plugdefou: "Plug-de-fou", slowmo: "SlowMo", boom: "Boom" };

function pluginOf(name) {
  const flat = name.toLowerCase().replace(/[^a-z]/g, "");
  for (const k in PLUGINS) if (flat.startsWith(k)) return PLUGINS[k];
  return null;
}

function platformOf(name) {
  if (/\.dmg$|mac/i.test(name)) return "mac";
  if (/\.exe$|win/i.test(name)) return "win";
  return "other";
}

function summarize(releases) {
  const out = { total: 0, plugins: {}, files: [], at: Date.now() };
  for (const k in PLUGINS) out.plugins[PLUGINS[k]] = { total: 0, mac: 0, win: 0 };
  for (const r of releases) {
    for (const a of r.assets || []) {
      out.total += a.download_count;
      out.files.push({ release: r.tag_name, name: a.name, count: a.download_count, size: a.size });
      const p = pluginOf(a.name);
      if (!p) continue;
      const plat = platformOf(a.name);
      out.plugins[p].total += a.download_count;
      if (plat !== "other") out.plugins[p][plat] += a.download_count;
    }
  }
  return out;
}

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch (e) { return null; }
}

// Renvoie { data, live } ; data vaut null si on n'a ni l'API ni de valeur en mémoire
async function loadCounts() {
  try {
    let releases = [];
    for (let page = 1; page <= 10; page++) {
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`, { headers: { Accept: "application/vnd.github+json" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const batch = await res.json();
      releases = releases.concat(batch);
      if (batch.length < 100) break;
    }
    const data = summarize(releases);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) {}
    return { data, live: true };
  } catch (e) {
    return { data: readCache(), live: false };
  }
}
