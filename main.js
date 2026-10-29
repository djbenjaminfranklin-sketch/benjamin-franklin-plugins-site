// Traductions anglaises ; le français est le texte d'origine de la page
const EN = {
  "nav.plugins": "The plugins",
  "nav.bio": "The guy",
  "nav.install": "Install",
  "hero.kicker": "A plugin brand by",
  "hero.sub": "3 <b>free</b> audio plugins. No subscription. No account. Just sound that goes completely nuts (but in time).",
  "hero.compat": "VST3 + AU on Mac (Apple Silicon M1 → M5 and Intel, macOS 12+) · VST3 on Windows 10/11 64-bit",
  "ticker": "FREE ✦ VST3 ✦ AU ✦ MAC ✦ WINDOWS ✦ TEMPO-SYNCED ✦ NO SUBSCRIPTION ✦ NO ACCOUNT ✦ ",
  "fou.tag": "The glitch that loses its mind. In time.",
  "fou.desc": "Six chaos machines locked to your track's tempo: <b>stutter</b>, <b>bitcrush</b>, <b>tape stop</b>, <b>reverse</b>, <b>gate</b> and <b>pitch glitch</b>. Turn the big <b>CHAOS</b> knob and GLITCH-O, the mascot, starts to panic. The more he sweats, the crazier it gets.",
  "fou.f1": "<b>20 recipes</b> ready to go in one second",
  "fou.f2": "<b>DIVISION</b> from 1/4 to 1/32: from gentle chopping to total mayhem",
  "fou.f3": "<b>MIX</b> to dose the disaster",
  "fou.f4": "Save your own <b>configs</b> and get your favourite chaos back",
  "slow.tag": "Action-movie slow motion. Without the demon voice.",
  "slow.desc": "Want to slow the whole track down in the break, then slam the drop at full speed? SlowMo slows the sound down <b>without changing its pitch</b> (time-stretch). No voice dropping into the basement, no hoarse duck. Just a clean slow-mo, and a purple bird losing its mind.",
  "slow.f1": "<b>2 knobs</b>, that's it: <b>SLOW</b> and <b>TARGET</b>",
  "slow.f2": "Live tempo display: <b>120 → 57 BPM</b>",
  "slow.f3": "Perfect for breaks, intros and fake endings",
  "slow.f4": "Back to tempo on the drop, like nothing happened",
  "boom.tag": "The mad scientist of drops.",
  "boom.desc": "Boom builds your drop impacts: <b>sub boom</b>, <b>downlifter</b>, <b>uplifter</b>. And because the sound is <b>generated</b> (not a stretched sample), it stays clean up to <b>128 bars</b>, locked to your tempo. Riser samples never go that long and sound like a saucepan once stretched. Boom doesn't break.",
  "boom.f1": "A big <b>BOOM!</b> button (yes, you press it)",
  "boom.f2": "Tweakable <b>sub boom</b>: type, tune, length, detune",
  "boom.f3": "Rising or falling <b>swipe</b>, from 1 to 128 bars",
  "boom.f4": "Always in sync with your project's tempo",
  "dl.mac": "Mac",
  "bio.sticker": "That's him!",
  "bio.title": "Who is",
  "bio.nope": "(Not the guy on the 100-dollar bill. The other one.)",
  "bio.p1": "A Parisian DJ and producer, Benjamin Franklin has been moving house dancefloors for over 20 years. He grew up in the legendary clubs of the 90s (<b>Les Bains Douches, La Locomotive, Le Queen</b>) and forged a sound of his own, blending house, soul and Latin rhythms.",
  "bio.p2": "His <b>“Who The Fuck Is Benjamin Franklin?”</b> parties set dancefloors on fire from Paris to Miami via Buenos Aires. Signed to <b>MIYU Records</b>, he has released tracks like <b>“This Is My House”</b>, <b>“Chupa Sin Mano”</b> and <b>“THIS SOUND”</b>.",
  "bio.p3": "Then one day he thought: <i>“The tools I need in the studio, I'll build them myself.”</i> So he created his own plugin brand… and decided to <b>give them away to every producer</b>. For free. No catch. Because music is meant to be shared.",
  "inst.title": "Install in 30 seconds",
  "inst.sub": "Promise, it's easier than tuning a kick.",
  "mac.1": "Download the plugin's <b>.dmg</b> and open it (double-click).",
  "mac.2": "In Finder, press <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>G</kbd> and type <code>~/Library/Audio/Plug-Ins/</code>",
  "mac.3": "Drag the <b>.vst3</b> file into the <code>VST3</code> folder, and the <b>.component</b> file into the <code>Components</code> folder.",
  "mac.4": "Restart your music software (Logic, Ableton, FL Studio…). Done!",
  "mac.note": "The plugins are <b>notarized by Apple</b>: no security warning. Logic and GarageBand use the <b>AU</b> version (.component), everything else uses <b>VST3</b>.",
  "win.1": "Download the plugin's <b>.exe</b> installer and run it.",
  "win.2": "Windows may show <b>“Windows protected your PC”</b>: click <b>More info</b> → <b>Run anyway</b>.",
  "win.3": "Click <b>Next</b> all the way. The plugin installs itself into <code>C:\\Program Files\\Common Files\\VST3</code>.",
  "win.4": "Restart your music software (Ableton, FL Studio, Cubase, Reaper…). Done!",
  "win.note": "Why the warning? The installer isn't digitally signed yet (it costs a fortune). The file is safe: it comes straight from here.",
  "faq.q1": "Is it really free?",
  "faq.a1": "Yes. No subscription, no account, no email to hand over, no hidden “pro” version. Download, produce.",
  "faq.q3": "Does it run on my M4 / M5 Mac?",
  "faq.a3": "Yes: Apple Silicon (M1 to M5) and Intel Macs, macOS 12 and up.",
  "faq.q4": "What about Linux? iPad?",
  "faq.a4": "Not for now. Mac and Windows only.",
  "foot.made": "Made with love, coffee and slightly too much glitch."
};

const nodes = document.querySelectorAll("[data-i18n],[data-i18n-html]");
const FR = new Map();
nodes.forEach(n => FR.set(n, n.innerHTML));

function setLang(lang) {
  nodes.forEach(n => {
    const key = n.dataset.i18n || n.dataset.i18nHtml;
    n.innerHTML = lang === "en" && EN[key] ? EN[key] : FR.get(n);
  });
  document.documentElement.lang = lang;
  document.getElementById("lang").textContent = lang === "en" ? "FR" : "EN";
  try { localStorage.setItem("bf-lang", lang); } catch (e) {}
}

let lang = "fr";
try {
  lang = localStorage.getItem("bf-lang") || "fr";
} catch (e) {}
if (lang === "en") setLang("en");
document.getElementById("lang").addEventListener("click", () => {
  lang = lang === "en" ? "fr" : "en";
  setLang(lang);
});

// onglets Mac / Windows (Windows ouvert d'office pour les visiteurs sous Windows)
const tabs = document.querySelectorAll(".tab");
function openTab(name) {
  tabs.forEach(t => t.classList.toggle("on", t.dataset.tab === name));
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("on", p.id === "tab-" + name));
}
tabs.forEach(t => t.addEventListener("click", () => openTab(t.dataset.tab)));
if (/Windows/i.test(navigator.userAgent)) openTab("win");

// le gros bouton BOOM! fait trembler la page
document.getElementById("boombtn").addEventListener("click", () => {
  document.body.classList.remove("shake");
  void document.body.offsetWidth;
  document.body.classList.add("shake");
  const t = document.createElement("div");
  t.className = "boomtxt";
  t.textContent = "BOOM!";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 900);
  if (navigator.vibrate) navigator.vibrate(120);
});
