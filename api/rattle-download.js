// Téléchargement RATTLE! : vérifie le jeton reçu par e-mail, puis renvoie vers le bon installateur
const { tokenIsValid } = require('./_rattle');

const page = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>
<style>body{margin:0;background:#0c0a12;color:#eeeaf2;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.5}.w{max-width:560px;margin:0 auto;padding:32px 16px;text-align:center}img{width:100%;max-width:380px}.c{background:#1a1722;border-radius:20px;padding:24px 20px;margin-top:16px}a.b{display:block;background:#ff2d74;color:#fff;text-decoration:none;font-weight:800;font-size:17px;padding:16px;border-radius:40px;margin:12px auto 0;max-width:340px}p{color:#a49db0}a{color:#c77dff}</style></head>
<body><div class="w"><img src="/rattle/logo.webp" alt="RATTLE!"><div class="c">${body}</div></div></body></html>`;

// Installateurs rangés dans une version PRIVÉE du dépôt GitHub de RATTLE! : on demande à GitHub une adresse
// de téléchargement temporaire (quelques minutes) et on y renvoie l'acheteur.
const ASSETS = { mac: process.env.RATTLE_MAC_ASSET, win: process.env.RATTLE_WIN_ASSET };
async function adresseTemporaire(id) {
  const r = await fetch(`https://api.github.com/repos/djbenjaminfranklin-sketch/rattle/releases/assets/${id}`, {
    headers: { Authorization: `token ${process.env.RATTLE_GH_TOKEN}`, Accept: 'application/octet-stream', 'User-Agent': 'rattle-site' },
    redirect: 'manual',
  });
  return r.headers.get('location');
}

module.exports = async (req, res) => {
  const { s, t, os } = req.query || {};
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!tokenIsValid(String(s || ''), String(t || ''))) {
    return res.status(403).send(page('Invalid link', '<h2>This link is not valid.</h2><p>Use the link from your purchase email, or write to <a href="mailto:contact@benjaminfranklinmusic.com">contact@benjaminfranklinmusic.com</a>.</p><p>Ce lien n\'est pas valable : utilise celui de ton e-mail d\'achat.</p>'));
  }
  const files = { mac: process.env.RATTLE_MAC_URL || ASSETS.mac, win: process.env.RATTLE_WIN_URL || ASSETS.win };
  if (os === 'mac' || os === 'win') {
    let url = os === 'mac' ? process.env.RATTLE_MAC_URL : process.env.RATTLE_WIN_URL;
    if (!url && ASSETS[os]) { try { url = await adresseTemporaire(ASSETS[os]); } catch (e) { console.error(e); } }
    if (url) { res.statusCode = 302; res.setHeader('Location', url); return res.end(); }
    return res.status(503).send(page('RATTLE! download', '<h2>Download temporarily unavailable</h2><p>Please try again in a minute, or write to <a href="mailto:contact@benjaminfranklinmusic.com">contact@benjaminfranklinmusic.com</a>.</p>'));
  }
  if (!files.mac && !files.win) {
    return res.status(200).send(page('RATTLE! download', '<h2>Your purchase is confirmed!</h2><p>The installers are being finalised: we\'ll email you the moment they\'re ready. This same link will then work.</p><p>Ton achat est confirmé ! Les installateurs sont en finition : tu reçois un e-mail dès qu\'ils sont prêts, et ce même lien fonctionnera.</p>'));
  }
  const base = `/api/rattle-download?s=${encodeURIComponent(s)}&t=${encodeURIComponent(t)}`;
  return res.status(200).send(page('RATTLE! download', `<h2>Download RATTLE!</h2><p>Choose your computer · Choisis ton ordinateur</p>
${files.mac ? `<a class="b" href="${base}&os=mac">Mac (Apple Silicon & Intel)</a>` : ''}
${files.win ? `<a class="b" href="${base}&os=win">Windows</a>` : ''}`));
};
