# Codexstudys Music

Static Next.js export (no build step). Deploy: `vercel --prod` from this folder (or drag the folder into Vercel). `vercel.json` handles clean URLs, service-worker headers and the image redirect.

- Persistent player: one global audio element (survives route changes); state saved in localStorage (`cxm_*`).
- Downloads: IndexedDB `codexstudys-music`, page `/downloads`, Library -> Downloaded Songs.
- PWA: `/manifest.webmanifest`, single `/sw.js`, icons in `/icons`.
- Clear All Data (menu/Settings) is the only thing that wipes app data, after confirmation.
