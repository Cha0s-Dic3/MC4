# Run Frontend + Backend

## Terminal 1 (Backend)

```powershell
cd backend
copy .env.example .env
npm install
npm run db:init
npm run dev
```

Backend runs on: `http://localhost:4000`
Admin panel interface:

- Direct backend: `http://localhost:4000/admin-panel`
- Hidden frontend route (no nav link): `http://localhost:5173/admin-panel`

## Terminal 2 (Frontend)

```powershell
cd web
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

CV page is available at:

- `http://localhost:5173/cv`
