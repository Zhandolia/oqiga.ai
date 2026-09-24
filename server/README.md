# Self-hosted voice studio

OQIGA.AI uses [Chatterbox Turbo](https://github.com/resemble-ai/chatterbox), an MIT-licensed pretrained English voice model. It conditions generation on a recording; this is **not training a new base model**, and voice similarity is not guaranteed. Generated audio retains the model's Perth watermark. The public GitHub Pages frontend does not have a GPU backend attached.

## Run locally, without a cloud subscription

Requirements: Node 20+, Python 3.11 or 3.12, and enough disk space for PyTorch plus several GB of model weights. An NVIDIA GPU is recommended. The tested Windows configuration is an RTX 5070 with 12 GB VRAM, Torch/Torchaudio 2.8.0 CUDA 12.8, and Chatterbox 0.1.7. CPU setup is provided but performance has not been validated.

From the repository root:

```sh
npm ci --legacy-peer-deps
npm run build
python server/setup.py
```

On Windows:

```powershell
server\.venv\Scripts\python.exe server\run.py
```

On Linux:

```sh
server/.venv/bin/python server/run.py
```

Open **http://127.0.0.1:8787/**, then Story. The first preview downloads and loads the model. Keep the terminal open; stop with Ctrl+C. Add `--cpu` to the setup command for CPU-only PyTorch. Setup installs a tested Torch override because the model package's declared Torch 2.6 pin predates RTX 50-series support. `setuptools==80.9.0` supplies the legacy resource API used by Perth. The inference-only installation intentionally omits Gradio.

## Recording and approval

1. An adult confirms that they are recording their own voice.
2. Record or upload all three readings: 15–90 seconds each, at least 60 seconds combined, below 12 MB each.
3. Both browser and server reject empty, silent, clipped, unreadable, or incorrectly sized clips. These are signal checks, not proof of speaker identity or speech recognition.
4. The server selects a continuous 12-second reference with strong signal from the recordings. The 60-second collection target gives the parent several samples to review; it is not a claim that all samples train the model.
5. Listen to the generated preview, approve it, then generate a library story or an authorized personal passage. If it sounds wrong, re-record. There is no fabricated similarity score.

The browser's standard narrator is a separate, clearly labeled playback option and never impersonates a parent.

## Data and deployment boundaries

- Local UI and API use the same origin. No voice API credentials are placed in the frontend.
- A random bearer token held in tab memory protects each session's voice and audio endpoints. Jobs are serialized to prevent one voice's model conditioning leaking into another job.
- Recordings, references, and generated audio remain in `server/data/session-*`. Delete them with **Delete Voice & Recordings**. Inactive sessions expire after one hour and are removed by a periodic cleanup; orphan files are removed on the next server startup. If the process is stopped, cleanup waits until restart.
- Refreshing the tab loses its token and recording references; server copies remain until expiry or restart. Story bookmarks are the only data stored in browser local storage.
- Downloads saved by a user are independent copies and are not removed by session deletion.
- The default binds only to `127.0.0.1`. It does not publish the GPU to the internet. Do not expose this local demo directly: a shared public service needs login, durable ownership, rate limiting, HTTPS, storage limits, and an operational deletion policy.
- GitHub Pages is the free frontend. To enable the same frontend on a separately hosted service later, use a same-origin `/api` reverse proxy and build with `REACT_APP_VOICE_API_URL=/api`. Merely setting a cross-origin URL will not work with the current same-origin protection. Vercel functions cannot run this GPU model.

Optional environment variables: `VOICE_PORT` (8787), `VOICE_DEVICE` (`cuda` or `cpu`), `VOICE_DATA_DIR`, `HF_HOME` (model cache), and `FFMPEG_BINARY`. Run only one server process because sessions and jobs are in memory.

## Checks

```sh
python -m pip install pytest==9.1.0 httpx==0.28.1
python -m pytest server/test_app.py -q
```

Run those commands with the virtual environment's Python. The ten API tests use a fake inference engine to validate consent, ownership, audio validation, approval, deletion, expiry, origin checks, and text chunking. A separate real GPU smoke test is needed to assess inference. Voice likeness must be evaluated with the consenting parent's own recordings; synthetic fixtures cannot establish that.
