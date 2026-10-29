// Liste d'attente RATTLE! : ajoute l'e-mail à la liste Mailjet (clés dans les variables Vercel)
const LIST_ID = 10626414;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  if (body.website) return res.status(200).json({ ok: true }); // piège à robots
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) {
    return res.status(400).json({ ok: false, error: 'email' });
  }
  const auth = Buffer.from(`${process.env.MJ_PUBLIC}:${process.env.MJ_SECRET}`).toString('base64');
  const r = await fetch(`https://api.mailjet.com/v3/REST/contactslist/${LIST_ID}/managecontact`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ Email: email, Action: 'addnoforce' }),
  });
  if (!r.ok) return res.status(502).json({ ok: false, error: 'mailjet' });
  return res.status(200).json({ ok: true });
};
