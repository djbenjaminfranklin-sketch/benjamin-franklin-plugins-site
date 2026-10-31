// Activation de RATTLE! : 2 ordinateurs par achat.
// La liste des ordinateurs d'un acheteur est gardée dans sa fiche Mailjet (propriété « rattle_macs »).
// Le certificat renvoyé est signé (RSA, clé privée dans RATTLE_LICENCE_KEY) : RATTLE! le vérifie avec la clé publique.
const crypto = require('crypto');
const { licenceKeyIsValid, mailjetAuth } = require('./_rattle');

const MAX_MACHINES = 2;
const PROP = 'rattle_macs';
const MJ = 'https://api.mailjet.com/v3/REST';

const headers = () => ({ Authorization: mailjetAuth(), 'Content-Type': 'application/json' });

// « id:nom;id:nom » → [{ id, nom }]
async function readMachines(email) {
  const r = await fetch(`${MJ}/contactdata/${encodeURIComponent(email)}`, { headers: headers() });
  if (r.status === 404) return [];
  if (!r.ok) throw new Error(`mailjet read ${r.status}`);
  const j = await r.json();
  const d = ((j.Data && j.Data[0] && j.Data[0].Data) || []).find(x => x.Name === PROP);
  return String((d && d.Value) || '').split(';').filter(Boolean).map(x => { const [id, ...n] = x.split(':'); return { id, nom: n.join(':') }; });
}

async function writeMachines(email, list) {
  const body = JSON.stringify({ Data: [{ Name: PROP, Value: list.map(m => `${m.id}:${m.nom}`).join(';') }] });
  const put = () => fetch(`${MJ}/contactdata/${encodeURIComponent(email)}`, { method: 'PUT', headers: headers(), body });
  let r = await put();
  if (r.status === 404) {   // contact absent : on le crée
    await fetch(`${MJ}/contact`, { method: 'POST', headers: headers(), body: JSON.stringify({ Email: email }) });
    r = await put();
  }
  if (!r.ok) {   // propriété pas encore déclarée chez Mailjet : on la déclare une fois
    await fetch(`${MJ}/contactmetadata`, { method: 'POST', headers: headers(), body: JSON.stringify({ Datatype: 'str', Name: PROP, NameSpace: 'static' }) });
    r = await put();
  }
  if (!r.ok) throw new Error(`mailjet write ${r.status}: ${await r.text()}`);
}

function certificate(email, machine) {
  const msg = `RATTLE1|${email}|${machine}`;
  return crypto.sign('sha256', Buffer.from(msg, 'utf8'), process.env.RATTLE_LICENCE_KEY.replace(/\\n/g, '\n')).toString('hex');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  let b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  const email = String(b.email || '').trim().toLowerCase();
  const machine = String(b.machine || '').trim().toLowerCase();
  const nom = String(b.name || 'Mac').replace(/[;:]/g, ' ').trim().slice(0, 40) || 'Mac';
  const action = String(b.action || 'activate');
  if (!/^[0-9a-f]{24}$/.test(machine)) return res.status(400).json({ ok: false, error: 'machine' });
  if (!licenceKeyIsValid(email, b.key)) return res.status(403).json({ ok: false, error: 'key' });
  try {
    let list = await readMachines(email);
    const here = list.some(m => m.id === machine);
    if (action === 'check') return res.status(200).json({ ok: true, active: here });
    if (action === 'deactivate') {
      if (here) await writeMachines(email, list.filter(m => m.id !== machine));
      return res.status(200).json({ ok: true });
    }
    if (!here) {
      if (list.length >= MAX_MACHINES) return res.status(409).json({ ok: false, error: 'full', machines: list.map(m => m.nom) });
      list = [...list, { id: machine, nom }];
      await writeMachines(email, list);
    }
    return res.status(200).json({ ok: true, cert: certificate(email, machine), machines: list.map(m => m.nom) });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, error: 'server' });
  }
};
