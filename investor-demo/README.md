# CivilApp Investor Demo

A completely standalone frontend demo for investor, client, and presentation use.

This folder does **not** import from or modify the main `frontend/` application and does not require the FastAPI backend.

## Demo logins

### CivilApp Infra
- Email: `infra@civilapp.demo`
- Password: `demo123`

### CivilApp Build
- Email: `build@civilapp.demo`
- Password: `demo123`

## Run locally

```bash
cd investor-demo
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Separate Vercel deployment

Create a second Vercel project pointing to the same GitHub repository and set the **Root Directory** to:

`investor-demo`

Vercel will use:

- Build command: `npm run build`
- Output directory: `dist`

No environment variables or backend are required.

## Demo scope

The standalone showcase includes:

- Premium investor login
- Separate Infra and Build experiences from the same login
- Infrastructure executive portfolio dashboard
- Map-style portfolio visualization
- Project performance cards with imagery
- Rail/road project command center
- Chainage status visualization
- Layer / BOQ progress
- Machinery health
- Field update photos
- Build development portfolio
- Villa-by-villa matrix
- Visual construction journey
- Before / during / after evidence
- Stage timeline
- Snagging and issues
- Responsive desktop/tablet/mobile UI

The images are presentation-only remote image assets and do not represent actual CivilApp project evidence.
