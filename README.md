# GIWA Desk

Visual shell for the GIWA trading desk. Sample Hood scan data only. Nothing here sends a transaction or holds a key.

**Live demo:** https://giwa-desk.vercel.app  
**Source:** private repo at https://github.com/Rahmandefi/giwa-desk

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173

- Hover a scan row for the glass card. Right-click pins it.
- `[` collapses the left rail.
- Connect and swap are previews.

## Deploy

```bash
npx vercel deploy --prod --yes
```

To auto-deploy on every push, give the Vercel GitHub App access to this private repo, then run `npx vercel git connect`.
