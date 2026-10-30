// Outils partagés RATTLE! : jeton de téléchargement signé et envoi Mailjet
const crypto = require('crypto');

const SITE = 'https://benjaminfranklinmusic.com';
const BUYERS_LIST_ID = 10626422; // liste Mailjet « RATTLE! - acheteurs »

// Jeton = HMAC(identifiant de la session Stripe) : seul le webhook (après paiement) sait le fabriquer
function downloadToken(sessionId) {
  return crypto.createHmac('sha256', process.env.DOWNLOAD_SECRET).update(`rattle:${sessionId}`).digest('hex').slice(0, 32);
}

function tokenIsValid(sessionId, token) {
  if (!sessionId || !token || token.length !== 32) return false;
  return crypto.timingSafeEqual(Buffer.from(downloadToken(sessionId)), Buffer.from(token));
}

function downloadUrl(sessionId) {
  return `${SITE}/api/rattle-download?s=${encodeURIComponent(sessionId)}&t=${downloadToken(sessionId)}`;
}

function mailjetAuth() {
  return 'Basic ' + Buffer.from(`${process.env.MJ_PUBLIC}:${process.env.MJ_SECRET}`).toString('base64');
}

function emailHtml(link) {
  const btn = (href, label) => `<a href="${href}" style="display:inline-block;background:#ff2d74;color:#fff;text-decoration:none;font-weight:800;font-size:17px;padding:15px 28px;border-radius:40px">${label}</a>`;
  return `<!doctype html><html><body style="margin:0;background:#f4f1f7;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1a1722">
<div style="max-width:560px;margin:0 auto;padding:28px 16px">
<div style="background:#0c0a12;border-radius:20px;padding:26px 22px;text-align:center">
<img src="${SITE}/rattle/logo-mail.png" alt="RATTLE!" width="360" style="max-width:100%;height:auto">
<h1 style="color:#8aff2b;font-size:26px;margin:14px 0 8px">You're in!</h1>
<p style="color:#d9d3e2;font-size:16px;line-height:1.5;margin:0 0 20px">Thank you for buying RATTLE!. Your download (Mac & Windows) is one click away:</p>
${btn(link, 'Download RATTLE!')}
<p style="color:#a49db0;font-size:13px;line-height:1.5;margin:20px 0 0">Keep this email: the link stays valid if you need to install again.</p>
</div>
<div style="background:#fff;border-radius:20px;padding:22px;margin-top:14px;text-align:center">
<h2 style="font-size:20px;margin:0 0 8px">C'est à toi !</h2>
<p style="font-size:15px;line-height:1.5;margin:0 0 18px;color:#4a4458">Merci d'avoir acheté RATTLE!. Ton téléchargement (Mac et Windows) est à un clic :</p>
${btn(link, 'Télécharger RATTLE!')}
<p style="color:#7a7388;font-size:13px;line-height:1.5;margin:18px 0 0">Garde cet e-mail : le lien reste valable si tu dois réinstaller.</p>
</div>
<p style="text-align:center;color:#7a7388;font-size:12px;margin:18px 0 0">Benjamin Franklin · <a href="mailto:contact@benjaminfranklinmusic.com" style="color:#7a7388">contact@benjaminfranklinmusic.com</a></p>
</div></body></html>`;
}

async function sendDownloadEmail(email, name, sessionId) {
  const link = downloadUrl(sessionId);
  const r = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: { Authorization: mailjetAuth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ Messages: [{
      From: { Email: 'booking@benjaminfranklinmusic.com', Name: 'Benjamin Franklin' },
      To: [{ Email: email, Name: name || email }],
      ReplyTo: { Email: 'contact@benjaminfranklinmusic.com', Name: 'Benjamin Franklin' },
      Subject: 'Your RATTLE! download / Ton téléchargement RATTLE!',
      TextPart: `Thank you for buying RATTLE! Download it here: ${link}\n\nMerci d'avoir acheté RATTLE! Télécharge-le ici : ${link}\n\nBenjamin Franklin`,
      HTMLPart: emailHtml(link),
      CustomID: `rattle-${sessionId}`,
    }] }),
  });
  if (!r.ok) throw new Error(`mailjet send ${r.status}: ${await r.text()}`);
  // Ajout à la liste des acheteurs (mises à jour du plugin) ; un échec ici ne bloque pas l'envoi
  await fetch(`https://api.mailjet.com/v3/REST/contactslist/${BUYERS_LIST_ID}/managecontact`, {
    method: 'POST',
    headers: { Authorization: mailjetAuth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ Email: email, Action: 'addnoforce' }),
  }).catch(() => {});
}

module.exports = { tokenIsValid, sendDownloadEmail, downloadUrl };
