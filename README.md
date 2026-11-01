# Foldsheet Zine

Write eight miniature pages and print their imposed layout on a single folding sheet.

## Reading and exchanging drafts

In **Front cover**, choose orbit rings, a paper fan, ribbon waves, or type alone. The ink and motif appear on page 1 in the proof, reader, and printed sheet. Draft downloads include custom cover choices; older version 1 files open with the raspberry rings design.

Open **Read the folded zine** to turn through pages 1–8 upright. The sheet proof still shows the arrangement used for printing.

Use **Download draft** to save all eight pages as a JSON file named after the cover. To restore a file, choose it under **Draft files**, check the cover title, and select **Replace current draft**. Files must contain an eight-page version 1 Foldsheet draft and fit within 24 KB. Cancel an import to keep editing the current draft.

## Run locally

Use Node.js 22 or newer to run `node scripts/verify.mjs`. To launch a local preview, run `python3 -m http.server 8080 --bind 127.0.0.1 --directory public` and open http://127.0.0.1:8080.

## Deployment

Vercel serves `public/` directly. The application uses browser platform APIs and ships with no package dependencies.

## Git dates

The initial commits use retrospective author dates from October–November 2026. Their committer timestamps record when this repository was assembled.
