# OQIGA.AI

A simple storytelling app, restored to its original Home / About / Story interface and green-and-yellow animated background.

Live demo: https://zhandolia.github.io/oqiga.ai/

## Run and publish

```sh
npm ci --legacy-peer-deps
npm start
```

`npm run build` builds the app. `npm run pages:build` also copies the app's required static assets into `docs/`. Commit and push `docs/` to publish through GitHub Pages (main branch, `/docs`). Relative asset URLs and hash routes allow the same build to work beneath `/oqiga.ai/` and on localhost.

The original Vercel address can still serve the same frontend. GitHub Pages is the primary demo link.

## What changed

The original title, logo, background, navigation and two-column Story layout are restored. Small layout fixes keep background shapes behind content, prevent narrow-screen overflow, stack the Story columns on mobile, and keep navigation available on every page. The original Drippy story is the default; a plain dropdown provides five more original bedtime stories and a personal-text option.

The broken notebook redirect and placeholder audio buttons were replaced by functional recording/upload controls connected to the existing local voice service. The public static demo explicitly labels standard device narration and the local-only AI voice requirement.

## Voice model

See [the self-hosting guide](server/README.md). The model setup remains available: three readings, at least 60 seconds total, signal checks, a listening preview, and approval before story generation. Chatterbox Turbo uses pretrained reference-audio conditioning; it does not train a new base model or promise a 100% identical voice.

GitHub Pages hosts the frontend only. Parent-voice inference runs on your own computer; no paid voice API or cloud GPU is configured. The browser's standard narrator is labeled separately.

Validation: production React build, desktop/mobile layout checks and navigation/story selection. The unchanged voice backend previously passed ten API tests and a real RTX 5070 upload/preview/approval/narration test using synthetic speech. Real-parent voice likeness still requires listening to their own preview.
