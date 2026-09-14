# SkillBridge 🚀

**Community Skill Exchange Platform**

SkillBridge connects local skill providers (tutors, technicians, designers, etc.) with people looking for their services. Built with React, Node.js/Express, PostgreSQL, and an AI-powered search microservice (Flask + TF-IDF/cosine similarity).

---

## Project Structure

```
client/     React frontend (Create React App + Tailwind CSS)
server/     Express API (PostgreSQL via node-postgres)
ai-model/   Flask AI recommendation microservice
```

## ✨ Features

- **Auth** — register/login (JWT), roles: admin / provider / seeker
- **Skills** — add, edit, delete (with photo), browse with search + category filter + pagination
- **Requests** — send a request to a provider, accept/reject, in-app chat once accepted
- **Reviews & Ratings** — rate a provider after an accepted request; average rating shown on skill cards
- **Profile** — edit name/location, change password, upload avatar
- **AI Search** — natural-language skill search via TF-IDF + cosine similarity
- **Admin panel** — manage users/skills/requests, view stats, export CSV

## Getting Started (local dev)

Each service needs its own `.env` — copy `.env.example` → `.env` in `client/` and `server/` and fill in real values.

```bash
# 1. Database
# Create a PostgreSQL database and a `skillbridge` schema (see server/config/db.js
# for the expected connection shape), then set DB_* (or DATABASE_URL) in server/.env

# 2. Backend
cd server
npm install
npm start          # http://localhost:5000 (or PORT from .env)

# 3. AI model
cd ai-model
pip install -r requirements.txt
python app.py       # http://localhost:5001

# 4. Frontend
cd client
npm install
npm start           # http://localhost:3000
```

## Deployment

The app reads its external URLs from environment variables rather than hardcoding `localhost`, so it can be deployed to separate hosts:

- `client`: set `REACT_APP_API_URL` to the deployed backend URL before `npm run build`.
- `server`: set `DATABASE_URL` (or `DB_*`) + `DB_SSL=true` for a hosted Postgres, `AI_MODEL_URL` for the deployed AI service, `CLIENT_URL` to restrict CORS, and a strong random `JWT_SECRET`.
- `ai-model`: run behind a production WSGI server (`gunicorn app:app`) rather than the Flask dev server; set `PORT` as provided by the host.

**Known limitation:** uploaded images are stored on local disk (`server/uploads/`). On hosts with an ephemeral filesystem this doesn't survive a redeploy — move to object storage (S3, Cloudinary, etc.) before relying on this in production.
