# Shadi Invites
Hindi wedding invitation site with personal links, WhatsApp sending, RSVP and an admin dashboard.

## Deploy (Render + free MongoDB Atlas)
1. Atlas: create a free cluster, a database user, allow access from anywhere (0.0.0.0/0), copy the connection string.
2. Put your music at `public/music.mp4` (or music.mp3), push this folder to GitHub.
3. Render: New > Blueprint (uses render.yaml) or New > Web Service. Set env vars `DATABASE_URL`, `ADMIN_PASSWORD`, `SECRET`.
4. Open `https://YOUR-APP.onrender.com/admin`, add guests, pick a template, tap Send.

Edit names, dates, venue and text in `wedding.js` and `views/invite.html`. Local run: copy `.env.example` to `.env`, `npm install`, `npm run dev`.
Render's free plan sleeps when idle, so open the site once before sending invites (or use a paid plan).
