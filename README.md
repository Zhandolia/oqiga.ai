# Kindred Moon

A calm bedtime story library with parent-controlled AI narration. Previously Oqiga.

## What works

- Five original stories, search, category filters, and saved stories.
- Responsive reading view, standard device narration, playback speed, and a sleep timer.
- Paste an original or authorized passage of up to 12,000 characters.
- Record/upload three readings, check signal quality and duration, create an AI preview, then approve before narration.
- A local Chatterbox Turbo GPU service with session-scoped audio, deletion, and expiry.

## Frontend

```sh
npm ci --legacy-peer-deps
npm start
```

Build with `npm run build`. `vercel.json` configures the static React build. Hash routes work without server-side route rewriting. On the public site, parent-voice generation is explicitly unavailable until a voice backend is connected; browser device narration is labeled separately.

## Voice model

See [the self-hosting guide](server/README.md). The old hackathon code referenced localhost, placeholder folders and a Colab notebook; the repository did not contain a functioning deployed inference service or a trained checkpoint. Historical files are preserved, but the new app uses `src/bedtime/` and `server/`.

The replacement uses a pretrained model with reference-audio conditioning. It does not claim to train a new base model or produce a 100% identical voice. Approve a listening preview before generating a story. No paid voice API is required. The local studio is designed for private use on one computer, not open public hosting.

## Validation

Production React build; ten API tests (`python -m pytest server/test_app.py -q`); and a real CUDA upload/preview/approval/narration smoke test on RTX 5070. The real-model fixture was synthetic speech, so this verifies the pipeline, not likeness to a real parent. Original library stories are provided in `src/bedtime/stories.js`; no commercial books are bundled.
