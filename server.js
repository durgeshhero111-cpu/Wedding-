require("express-async-errors");
const express = require("express"), { Pool } = require("pg"), crypto = require("crypto"),
  fs = require("fs"), path = require("path"), W = require("./wedding");
const { DATABASE_URL, ADMIN_PASSWORD, PORT = 3000 } = process.env;
if (!DATABASE_URL || !ADMIN_PASSWORD) { console.error("Set DATABASE_URL and ADMIN_PASSWORD"); process.exit(1); }
const SECRET = process.env.SECRET || ADMIN_PASSWORD;
const app = express(); app.set("trust proxy", 1); app.use(express.json({ limit: "1mb" }));

const pool = new Pool({ connectionString: DATABASE_URL, ssl: /render\.com/.test(DATABASE_URL) ? { rejectUnauthorized: false } : false });
const q1 = async (sql, p) => (await pool.query(sql, p)).rows;
const GUEST = `id::text AS "_id", name, mobile, address, code, sent, sent_at AS "sentAt", views, first_view AS "firstView", last_view AS "lastView", opened, rsvp, count, rsvp_at AS "rsvpAt", created_at AS "createdAt"`;
const get = async (k, d) => (await q1("SELECT value FROM settings WHERE key=$1", [k]))[0]?.value ?? d;
const put = (k, v) => q1("INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2", [k, v]);
async function init() {
  await pool.query(`CREATE TABLE IF NOT EXISTS guests(id SERIAL PRIMARY KEY, name TEXT NOT NULL, mobile TEXT NOT NULL, address TEXT DEFAULT '', code TEXT UNIQUE NOT NULL,
    sent BOOLEAN DEFAULT false, sent_at TIMESTAMPTZ, views INT DEFAULT 0, first_view TIMESTAMPTZ, last_view TIMESTAMPTZ, opened BOOLEAN DEFAULT false,
    rsvp TEXT DEFAULT '', count INT DEFAULT 0, rsvp_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
    CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);`);
}

const tok = () => crypto.createHmac("sha256", SECRET).update("admin").digest("hex");
const cookie = q => Object.fromEntries((q.headers.cookie || "").split(/;\s*/).map(c => c.split("=")));
const isAdmin = q => cookie(q).adm === tok();
const auth = (q, s, n) => isAdmin(q) ? n() : s.status(401).json({ error: "login" });

// ---------- invitation pages ----------
const tpl = fs.readFileSync(path.join(__dirname, "views/invite.html"), "utf8");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const music = () => ["music.mp4", "music.mp3", "music.m4a"].find(f => fs.existsSync(path.join(__dirname, "public", f)));
function page(q, res, g, theme) {
  const T = W.templates.find(t => t.id === theme) || W.templates[0], base = q.protocol + "://" + q.get("host");
  const boot = { code: g?.code || "", rsvp: g?.rsvp || "", count: g?.count || 2, music: music() ? "/" + music() : "", date: W.date };
  res.type("html").send(tpl
    .replaceAll("{{THEME}}", () => T.id).replaceAll("{{LAYOUT}}", () => T.layout).replaceAll("{{BL}}", () => T.bl || W.def.bl).replaceAll("{{SH}}", () => T.sh || W.def.sh).replaceAll("{{WISH}}", () => T.wish || W.def.wish).replaceAll("{{BASE}}", () => base).replaceAll("{{PATH}}", () => esc(q.originalUrl.split("?")[0])).replaceAll("{{GUEST}}", () => esc(g?.name || "आदरणीय परिवार"))
    .replaceAll("{{MAP}}", () => W.map).replace("{{BOOT}}", () => JSON.stringify(boot).replace(/</g, "\\u003c")));
}
const crawler = /bot|crawl|spider|preview|whatsapp|facebookexternalhit|telegram|slack/i;
app.get("/health", (q, s) => s.send("ok"));
app.get("/", async (q, s) => page(q, s, null, W.themes.includes(q.query.theme) ? q.query.theme : await get("theme", W.theme)));
app.get("/i/:code", async (q, s) => {
  const g = (await q1(`SELECT ${GUEST} FROM guests WHERE code=$1`, [q.params.code]))[0];
  if (!g) return s.status(404).send("Invitation not found");
  if (!crawler.test(q.get("user-agent") || "") && !isAdmin(q)) { // don't count WhatsApp previews or the admin
    await q1("UPDATE guests SET views=views+1, last_view=now(), first_view=COALESCE(first_view, now()) WHERE id=$1", [g._id]);
  }
  page(q, s, g, await get("theme", W.theme));
});
app.post("/api/open/:code", async (q, s) => {
  if (!isAdmin(q)) await q1("UPDATE guests SET opened=true WHERE code=$1", [q.params.code]);
  s.json({ ok: 1 });
});
app.post("/api/rsvp/:code", async (q, s) => {
  const r = q.body.rsvp; if (!["yes", "no"].includes(r)) return s.sendStatus(400);
  await q1("UPDATE guests SET rsvp=$1, count=$2, rsvp_at=now() WHERE code=$3", [r, r === "yes" ? Math.min(Math.max(+q.body.count || 1, 1), 20) : 0, q.params.code]);
  s.json({ ok: 1 });
});

// ---------- admin ----------
const fails = {};
app.post("/admin/login", (q, s) => {
  if ((fails[q.ip] || 0) >= 10) return s.status(429).json({ ok: false });
  if (q.body.password !== ADMIN_PASSWORD) { fails[q.ip] = (fails[q.ip] || 0) + 1; setTimeout(() => fails[q.ip]--, 9e5); return s.status(401).json({ ok: false }); }
  s.setHeader("Set-Cookie", `adm=${tok()}; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000${q.secure ? "; Secure" : ""}`);
  s.json({ ok: true });
});
app.get("/admin", (q, s) => s.sendFile(path.join(__dirname, "views/admin.html")));
app.use("/api/admin", auth);
app.get("/api/admin/data", async (q, s) => {
  const guests = await q1(`SELECT ${GUEST} FROM guests ORDER BY created_at DESC, id DESC`), n = f => guests.filter(f).length;
  s.json({ guests, themes: W.themes, templates: W.templates, theme: await get("theme", W.theme), msg: await get("msg", W.msg), music: !!music(),
    stats: { total: guests.length, sent: n(g => g.sent), seen: n(g => g.views > 0), opened: n(g => g.opened),
      yes: n(g => g.rsvp === "yes"), no: n(g => g.rsvp === "no"), pending: n(g => !g.rsvp),
      people: guests.reduce((a, g) => a + (g.rsvp === "yes" ? g.count : 0), 0) } });
});
app.post("/api/admin/guests", async (q, s) => { // lines: Name, Mobile, Address
  const docs = [], seen = new Set((await q1("SELECT name, mobile FROM guests")).map(r => r.name.toLowerCase() + "|" + r.mobile));
  let skipped = 0;
  String(q.body.text || "").split("\n").forEach(l => {
    const [name, m, ...a] = l.split(/[,\t|]/).map(x => x.trim());
    let mobile = (m || "").replace(/\D/g, "").replace(/^0+/, "");
    if (!name || mobile.length < 10) return;
    if (mobile.length === 10) mobile = "91" + mobile;
    const key = name.toLowerCase() + "|" + mobile;
    if (seen.has(key)) return skipped++; // same name + same number already exists
    seen.add(key);
    docs.push({ name, mobile, address: a.join(", "), code: crypto.randomBytes(5).toString("hex") });
  });
  for (const d of docs) await q1("INSERT INTO guests(name,mobile,address,code) VALUES($1,$2,$3,$4)", [d.name, d.mobile, d.address, d.code]);
  s.json({ added: docs.length, skipped });
});
app.put("/api/admin/guests/:id", async (q, s) => {
  const name = String(q.body.name || "").trim(); let mobile = String(q.body.mobile || "").replace(/\D/g, "").replace(/^0+/, "");
  if (mobile.length === 10) mobile = "91" + mobile;
  if (!name || mobile.length < 10) return s.status(400).json({ error: "name/mobile" });
  await q1("UPDATE guests SET name=$1, mobile=$2, address=$3 WHERE id=$4", [name, mobile, String(q.body.address || "").trim(), +q.params.id]);
  s.json({ ok: 1 });
});
app.post("/api/admin/guests/:id/sent", async (q, s) => { await q1("UPDATE guests SET sent=true, sent_at=now() WHERE id=$1", [+q.params.id]); s.json({ ok: 1 }); });
app.delete("/api/admin/guests/:id", async (q, s) => { await q1("DELETE FROM guests WHERE id=$1", [+q.params.id]); s.json({ ok: 1 }); });
app.post("/api/admin/settings", async (q, s) => {
  if (W.themes.includes(q.body.theme)) await put("theme", q.body.theme);
  if (q.body.msg) await put("msg", q.body.msg);
  s.json({ ok: 1 });
});

app.use(express.static(path.join(__dirname, "public")));
app.use((e, q, s, n) => { console.error(e); s.status(500).json({ error: "server" }); });
init().then(() => app.listen(PORT, () => console.log("Running on " + PORT))).catch(e => { console.error("Database error:", e.message); process.exit(1); });
