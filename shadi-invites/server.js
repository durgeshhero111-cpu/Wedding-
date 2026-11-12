require("express-async-errors");
const express = require("express"), mongoose = require("mongoose"), crypto = require("crypto"),
  fs = require("fs"), path = require("path"), W = require("./wedding");
const { MONGODB_URI, ADMIN_PASSWORD, PORT = 3000 } = process.env;
if (!MONGODB_URI || !ADMIN_PASSWORD) { console.error("Set MONGODB_URI and ADMIN_PASSWORD"); process.exit(1); }
const SECRET = process.env.SECRET || ADMIN_PASSWORD;
const app = express(); app.set("trust proxy", 1); app.use(express.json({ limit: "1mb" }));

const Guest = mongoose.model("Guest", new mongoose.Schema({
  name: String, mobile: String, address: String, code: { type: String, unique: true },
  sent: Boolean, sentAt: Date, views: { type: Number, default: 0 }, firstView: Date, lastView: Date,
  opened: Boolean, rsvp: { type: String, default: "" }, count: { type: Number, default: 0 }, rsvpAt: Date,
}, { timestamps: true }));
const Setting = mongoose.model("Setting", new mongoose.Schema({ _id: String, value: String }));
const get = async (k, d) => (await Setting.findById(k))?.value ?? d;
const put = (k, v) => Setting.findByIdAndUpdate(k, { value: v }, { upsert: true });

const tok = () => crypto.createHmac("sha256", SECRET).update("admin").digest("hex");
const cookie = q => Object.fromEntries((q.headers.cookie || "").split(/;\s*/).map(c => c.split("=")));
const isAdmin = q => cookie(q).adm === tok();
const auth = (q, s, n) => isAdmin(q) ? n() : s.status(401).json({ error: "login" });

// ---------- invitation pages ----------
const tpl = fs.readFileSync(path.join(__dirname, "views/invite.html"), "utf8");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const music = () => ["music.mp4", "music.mp3", "music.m4a"].find(f => fs.existsSync(path.join(__dirname, "public", f)));
function page(res, g, theme) {
  const boot = { code: g?.code || "", rsvp: g?.rsvp || "", count: g?.count || 2, music: music() ? "/" + music() : "", date: W.date };
  res.type("html").send(tpl
    .replaceAll("{{THEME}}", () => theme).replaceAll("{{GUEST}}", () => esc(g?.name || "आदरणीय परिवार"))
    .replaceAll("{{MAP}}", () => W.map).replace("{{BOOT}}", () => JSON.stringify(boot).replace(/</g, "\\u003c")));
}
const crawler = /bot|crawl|spider|preview|whatsapp|facebookexternalhit|telegram|slack/i;
app.get("/health", (q, s) => s.send("ok"));
app.get("/", async (q, s) => page(s, null, W.themes.includes(q.query.theme) ? q.query.theme : await get("theme", W.theme)));
app.get("/i/:code", async (q, s) => {
  const g = await Guest.findOne({ code: q.params.code });
  if (!g) return s.status(404).send("Invitation not found");
  if (!crawler.test(q.get("user-agent") || "") && !isAdmin(q)) { // don't count WhatsApp previews or the admin
    const set = { lastView: new Date() }; if (!g.firstView) set.firstView = set.lastView;
    await Guest.updateOne({ _id: g._id }, { $inc: { views: 1 }, $set: set });
  }
  page(s, g, await get("theme", W.theme));
});
app.post("/api/open/:code", async (q, s) => {
  if (!isAdmin(q)) await Guest.updateOne({ code: q.params.code }, { $set: { opened: true } });
  s.json({ ok: 1 });
});
app.post("/api/rsvp/:code", async (q, s) => {
  const r = q.body.rsvp; if (!["yes", "no"].includes(r)) return s.sendStatus(400);
  await Guest.updateOne({ code: q.params.code }, { $set: { rsvp: r, count: r === "yes" ? Math.min(Math.max(+q.body.count || 1, 1), 20) : 0, rsvpAt: new Date() } });
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
  const guests = await Guest.find().sort({ createdAt: -1 }).lean(), n = f => guests.filter(f).length;
  s.json({ guests, themes: W.themes, theme: await get("theme", W.theme), msg: await get("msg", W.msg), music: !!music(),
    stats: { total: guests.length, sent: n(g => g.sent), seen: n(g => g.views > 0), opened: n(g => g.opened),
      yes: n(g => g.rsvp === "yes"), no: n(g => g.rsvp === "no"), pending: n(g => !g.rsvp),
      people: guests.reduce((a, g) => a + (g.rsvp === "yes" ? g.count : 0), 0) } });
});
app.post("/api/admin/guests", async (q, s) => { // lines: Name, Mobile, Address
  const docs = [];
  String(q.body.text || "").split("\n").forEach(l => {
    const [name, m, ...a] = l.split(/[,\t|]/).map(x => x.trim());
    let mobile = (m || "").replace(/\D/g, "").replace(/^0+/, "");
    if (!name || mobile.length < 10) return;
    if (mobile.length === 10) mobile = "91" + mobile;
    docs.push({ name, mobile, address: a.join(", "), code: crypto.randomBytes(5).toString("hex") });
  });
  if (docs.length) await Guest.insertMany(docs);
  s.json({ added: docs.length });
});
app.post("/api/admin/guests/:id/sent", async (q, s) => { await Guest.findByIdAndUpdate(q.params.id, { sent: true, sentAt: new Date() }); s.json({ ok: 1 }); });
app.delete("/api/admin/guests/:id", async (q, s) => { await Guest.findByIdAndDelete(q.params.id); s.json({ ok: 1 }); });
app.post("/api/admin/settings", async (q, s) => {
  if (W.themes.includes(q.body.theme)) await put("theme", q.body.theme);
  if (q.body.msg) await put("msg", q.body.msg);
  s.json({ ok: 1 });
});

app.use(express.static(path.join(__dirname, "public")));
app.use((e, q, s, n) => { console.error(e); s.status(500).json({ error: "server" }); });
mongoose.connect(MONGODB_URI).then(() => app.listen(PORT, () => console.log("Running on " + PORT)));
