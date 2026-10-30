// Webhook Stripe : après un achat de RATTLE!, envoie le lien de téléchargement par e-mail
const crypto = require('crypto');
const { sendDownloadEmail } = require('./_rattle');

const TOLERANCE_S = 300;

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Vérification de la signature Stripe (en-tête « Stripe-Signature : t=…,v1=… »)
function verify(raw, header, secret) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map(p => p.split('=')).filter(p => p.length === 2 && p[0] === 't'));
  const t = parts.t;
  const sigs = header.split(',').filter(p => p.startsWith('v1=')).map(p => p.slice(3));
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - Number(t)) > TOLERANCE_S) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  return sigs.some(s => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const raw = await readRaw(req);
  if (!verify(raw.toString('utf8'), req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)) {
    return res.status(400).json({ error: 'signature' });
  }
  const event = JSON.parse(raw.toString('utf8'));
  const okType = event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded';
  const s = event.data && event.data.object;
  // Paiement différé (virement…) : on attend l'événement « async_payment_succeeded »
  if (!okType || !s || s.payment_status !== 'paid' || (s.metadata || {}).plugin !== 'rattle') {
    return res.status(200).json({ ignored: true });
  }
  const email = (s.customer_details && s.customer_details.email) || s.customer_email;
  if (!email) return res.status(200).json({ ignored: 'no email' });
  try {
    await sendDownloadEmail(email, s.customer_details && s.customer_details.name, s.id);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'mail' }); // Stripe réessaiera
  }
  return res.status(200).json({ sent: true });
};
