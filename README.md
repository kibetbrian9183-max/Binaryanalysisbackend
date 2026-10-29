# Primevest backend (Node + Express)
Three small endpoints that must run on a server: /api/token, /api/deriv, /api/otp (plus /health). No database.

## Deploy on Render
1. Upload this folder to a GitHub repo. Render > New > Web Service > pick the repo.
2. Build command: `npm install`   Start command: `npm start`
3. Environment variables (see .env.example): DERIV_CLIENT_ID, REDIRECT_URIS, CLIENT_ORIGINS.
4. Copy the service address (https://something.onrender.com) into the frontend's config.js.

## Local
`npm install && npm start` (port 4000). Add http://localhost:3000 to CLIENT_ORIGINS if you test the frontend locally.

Access tokens are never stored here: the browser keeps its own and sends it with each request.
