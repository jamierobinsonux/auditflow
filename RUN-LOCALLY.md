# AuditFlow prototype

A self-contained prototype. No accounts, no database, no cloud services.

## Run it
```bash
npm install            # Node 20.9 or newer
npm run dev            # http://localhost:3000
```
That's all. Open http://localhost:3000 and you're in the app.

## How it behaves
- **No sign-in.** You are always one built-in local user. The login, signup and
  password pages just redirect to the dashboard.
- **Your data is saved.** Projects, findings, clients, settings and uploaded
  images are written to a `.data/` folder inside the project as you work, and
  loaded again next time you start the app. Stop it, restart it, reboot your
  machine: it's all still there.
- **Just you.** There is one built-in local user, so there's nothing to share
  or sign in to.
- **Everything is unlocked.** No plans, billing, limits, analytics or email.
- **Start with sample data:** on the dashboard, use "Create demo project".

## Where the pieces are
- `lib/mockdb/` is the in-memory database that stands in for Supabase. The rest
  of the app still calls `createClient()` from `lib/supabase/*` and doesn't know
  the difference.
- `app/api/mockdb/` lets browser code reach that database.
- `app/storage/` serves uploaded images from `.data/files/`.

## Your saved data
- `.data/database.json` holds everything except images; `.data/files/` holds images.
- **Back it up:** copy the `.data` folder.
- **Start fresh:** stop the app, then `npm run reset-data` (or delete `.data`).
- **Keep it elsewhere:** set `AUDITFLOW_DATA_DIR=/some/folder` before starting.
- Use one running copy of the app at a time. Two servers sharing one `.data`
  folder will overwrite each other.
- Moving to a new machine? Copy `.data` into the new project folder.
