"""Kindred Moon's local, single-process voice studio. Bind to loopback by default."""
import asyncio
import logging
import os
import re
import secrets
import shutil
import subprocess
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from pathlib import Path

import imageio_ffmpeg
import numpy as np
import soundfile as sf
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent
DATA = Path(os.environ.get('VOICE_DATA_DIR', ROOT / 'data')).resolve()
DATA.mkdir(parents=True, exist_ok=True)
os.environ.setdefault('HF_HOME', str(DATA / 'model-cache'))
os.environ.setdefault('HF_HUB_DISABLE_XET', '1')
os.environ.setdefault('HF_HUB_DISABLE_SYMLINKS_WARNING', '1')
PREVIEW = 'The moon is shining softly over the garden. Let us settle in, take our time, and enjoy a little story together.'
TTL = 3600
MAX_BYTES = 12 * 1024 * 1024
sessions, jobs = {}, {}
executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix='voice-studio')
model = None
lock = threading.RLock()
log = logging.getLogger('kindred-moon')


def remove_private(path):
    path = Path(path).resolve()
    if path.parent != DATA or not path.name.startswith('session-'):
        raise ValueError('Unexpected private storage path')
    shutil.rmtree(path, ignore_errors=True)


def expire_sessions():
    with lock:
        for token, session in list(sessions.items()):
            if time.time() - session['touched'] > TTL:
                sessions.pop(token, None)
                for jid, job in list(jobs.items()):
                    if job['token'] == token:
                        jobs.pop(jid, None)
                remove_private(session['root'])


@asynccontextmanager
async def lifespan(app):
    # Session tokens never survive a restart, so remove orphaned private files.
    for path in DATA.glob('session-*'):
        if path.is_dir():
            remove_private(path)
    async def janitor():
        while True:
            await asyncio.sleep(60)
            expire_sessions()
    task = asyncio.create_task(janitor())
    yield
    task.cancel()


app = FastAPI(title='Kindred Moon voice studio', lifespan=lifespan, docs_url=None, redoc_url=None)


@app.middleware('http')
async def private_responses(request, call_next):
    # The self-hosted UI and API share one origin. Do not allow cross-site uploads.
    origin = request.headers.get('origin')
    expected = str(request.base_url).rstrip('/')
    if origin and origin != expected and request.url.path.startswith('/api/'):
        from fastapi.responses import JSONResponse
        return JSONResponse({'detail': 'Use the voice studio from its own address.'}, status_code=403)
    response = await call_next(request)
    if request.url.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-store'
    return response


def session_for(authorization: str = Header(default='')):
    token = authorization.removeprefix('Bearer ')
    with lock:
        session = sessions.get(token)
        if not session or time.time() - session['touched'] > TTL:
            raise HTTPException(401, 'Your voice session expired. Create a new preview to continue.')
        session['touched'] = time.time()
        return token, session


@app.get('/api/health')
def health():
    return {'status': 'ok', 'engine': 'Chatterbox Turbo', 'model_loaded': model is not None, 'mode': 'self-hosted', 'session_ttl_seconds': TTL}


@app.post('/api/sessions')
def create_session():
    expire_sessions()
    with lock:
        if len(sessions) >= 20:
            raise HTTPException(429, 'The local studio has too many open sessions. Try again later.')
        token = secrets.token_urlsafe(32)
        root = DATA / ('session-' + uuid.uuid4().hex)
        root.mkdir()
        sessions[token] = {'root': root, 'touched': time.time(), 'voices': {}}
    return {'token': token}


def get_model():
    global model
    if model is None:
        import torch
        from chatterbox.tts_turbo import ChatterboxTurboTTS
        torch.set_num_threads(4)
        device = os.environ.get('VOICE_DEVICE', 'cuda' if torch.cuda.is_available() else 'cpu')
        model = ChatterboxTurboTTS.from_pretrained(device=device)
    return model


def decode_sample(source, target):
    binary = os.environ.get('FFMPEG_BINARY') or imageio_ffmpeg.get_ffmpeg_exe()
    try:
        subprocess.run([binary, '-hide_banner', '-loglevel', 'error', '-y', '-protocol_whitelist', 'file,pipe', '-i', str(source), '-t', '91', '-vn', '-ac', '1', '-ar', '24000', str(target)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, timeout=40)
        samples, sr = sf.read(target, dtype='float32')
    except (subprocess.SubprocessError, RuntimeError) as exc:
        raise ValueError('A recording could not be decoded. Try WAV, MP3, or browser recording.') from exc
    duration = len(samples) / sr
    if not 15 <= duration <= 90:
        raise ValueError('Each reading must be between 15 and 90 seconds long.')
    if not np.isfinite(samples).all() or np.sqrt(np.mean(samples ** 2)) < .005:
        raise ValueError('A recording is too quiet. Please record it again closer to the microphone.')
    if np.mean(np.abs(samples) > .995) > .01:
        raise ValueError('A recording is distorted. Please record it again farther from the microphone.')
    # Find a continuous 12-second reference with sustained audio rather than silence.
    windows = [(float(np.sqrt(np.mean(samples[i:i + sr * 12] ** 2))), i) for i in range(0, max(1, len(samples) - sr * 12 + 1), sr)]
    quality, start = max(windows)
    return duration, quality, samples[start:start + sr * 12], sr


def submit_job(token, operation):
    with lock:
        if any(job['token'] == token and job['status'] in ('queued', 'running') for job in jobs.values()):
            raise HTTPException(409, 'Wait for the current voice job to finish.')
        if sum(job['status'] in ('queued', 'running') for job in jobs.values()) >= 3:
            raise HTTPException(429, 'The studio is busy. Try again when the current story finishes.')
        jid = uuid.uuid4().hex
        job = {'token': token, 'status': 'queued', 'message': 'Waiting for the voice studio…'}
        jobs[jid] = job
    def work():
        try:
            if token not in sessions:
                return
            job.update(status='running', message='Preparing the voice model…')
            operation(job)
            if token in sessions:
                job.update(status='completed', message='Audio ready.')
        except Exception as exc:
            log.exception('Voice job failed')
            message = str(exc) if isinstance(exc, ValueError) else 'The voice model could not finish. Check the local studio logs, then try again.'
            job.update(status='failed', error=message)
    executor.submit(work)
    return jid


@app.post('/api/voices')
async def create_voice(samples: list[UploadFile] = File(...), consent: bool = Form(False), name: str = Form('My voice'), auth=Depends(session_for)):
    token, session = auth
    if not consent:
        raise HTTPException(400, 'Confirm that the recordings are your own voice.')
    if len(samples) != 3:
        raise HTTPException(400, 'Upload all three readings.')
    # Reserve the session before reading uploads to avoid concurrent submissions.
    with lock:
        if session.get('uploading'):
            raise HTTPException(409, 'A voice upload is already in progress.')
        session['uploading'] = True
    vid = uuid.uuid4().hex
    folder = session['root'] / vid
    folder.mkdir()
    try:
        for index, upload in enumerate(samples):
            total = 0
            with (folder / f'{index}.input').open('wb') as out:
                while chunk := await upload.read(1024 * 1024):
                    total += len(chunk)
                    if total > MAX_BYTES:
                        raise HTTPException(413, 'Each reading must be smaller than 12 MB.')
                    out.write(chunk)
            if total == 0:
                raise HTTPException(400, 'A recording was empty.')
        voice = {'name': name.strip()[:40] or 'My voice', 'folder': folder, 'approved': False, 'preview_ready': False, 'consent_at': time.time()}
        def prepare(job):
            job['message'] = 'Checking the three recordings…'
            checked = [decode_sample(folder / f'{i}.input', folder / f'{i}.wav') for i in range(3)]
            if sum(item[0] for item in checked) < 60:
                raise ValueError('Please record at least 60 seconds across the three readings.')
            _, _, reference, sr = max(checked, key=lambda item: item[1])
            sf.write(folder / 'reference.wav', reference, sr)
            job['message'] = 'Creating your listening preview…'
            engine = get_model()
            wav = engine.generate(PREVIEW, audio_prompt_path=str(folder / 'reference.wav'))
            if token not in sessions:
                return
            sf.write(folder / 'preview.wav', wav.squeeze().cpu().numpy(), engine.sr)
            voice['preview_ready'] = True
        jid = submit_job(token, prepare)
        session['voices'][vid] = voice
        return {'voice_id': vid, 'job_id': jid}
    except Exception:
        shutil.rmtree(folder, ignore_errors=True)
        raise
    finally:
        session['uploading'] = False
        for upload in samples:
            await upload.close()


def find_voice(session, vid):
    voice = session['voices'].get(vid)
    if not voice:
        raise HTTPException(404, 'Voice not found in this session.')
    return voice


@app.get('/api/voices/{vid}/preview')
def voice_preview(vid: str, auth=Depends(session_for)):
    _, session = auth
    voice = find_voice(session, vid)
    if not voice['preview_ready']:
        raise HTTPException(409, 'The preview is not ready yet.')
    voice['preview_served'] = True
    return FileResponse(voice['folder'] / 'preview.wav', media_type='audio/wav')


@app.post('/api/voices/{vid}/approve')
def approve(vid: str, auth=Depends(session_for)):
    _, session = auth
    voice = find_voice(session, vid)
    if not voice.get('preview_served'):
        raise HTTPException(409, 'Listen to the generated preview before approving the voice.')
    voice['approved'] = True
    return {'approved': True}


class Narration(BaseModel):
    voice_id: str
    text: str = Field(min_length=1, max_length=12000)


def split_text(text, limit=350):
    chunks, current = [], ''
    for sentence in re.split(r'(?<=[.!?])\s+', text.strip()):
        for word in sentence.split():
            if len(word) > limit:
                raise ValueError('One word is too long to narrate. Please check the text.')
            if len(current) + len(word) + 1 > limit:
                chunks.append(current)
                current = ''
            current = (current + ' ' + word).strip()
        if len(current) > limit // 2:
            chunks.append(current)
            current = ''
    if current:
        chunks.append(current)
    return chunks


@app.post('/api/narrations')
def narrate(data: Narration, auth=Depends(session_for)):
    token, session = auth
    voice = find_voice(session, data.voice_id)
    if not voice['approved']:
        raise HTTPException(409, 'Approve your listening preview before narrating a story.')
    try:
        chunks = split_text(data.text)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    if not chunks:
        raise HTTPException(400, 'Add some story text first.')
    target = session['root'] / (uuid.uuid4().hex + '.wav')
    def generate(job):
        engine = get_model()
        engine.prepare_conditionals(str(voice['folder'] / 'reference.wav'))
        parts = []
        for i, chunk in enumerate(chunks):
            if token not in sessions:
                return
            job['message'] = f'Reading your story, part {i + 1} of {len(chunks)}…'
            parts.append(engine.generate(chunk).squeeze().cpu().numpy())
            parts.append(np.zeros(int(engine.sr * .3), dtype=np.float32))
        if token in sessions:
            sf.write(target, np.concatenate(parts), engine.sr)
            job['audio'] = target
    jid = submit_job(token, generate)
    return {'job_id': jid}


def owned_job(jid, token):
    job = jobs.get(jid)
    if not job or job['token'] != token:
        raise HTTPException(404, 'Audio job not found in this session.')
    return job


@app.get('/api/jobs/{jid}')
def job_status(jid: str, auth=Depends(session_for)):
    job = owned_job(jid, auth[0])
    return {key: job[key] for key in ('status', 'message', 'error') if key in job}


@app.get('/api/jobs/{jid}/audio')
def job_audio(jid: str, auth=Depends(session_for)):
    job = owned_job(jid, auth[0])
    if job['status'] != 'completed' or not job.get('audio'):
        raise HTTPException(409, 'Narration is not ready yet.')
    return FileResponse(job['audio'], media_type='audio/wav', filename='kindred-moon-story.wav')


@app.delete('/api/session')
def forget(auth=Depends(session_for)):
    token, session = auth
    with lock:
        sessions.pop(token, None)
        for jid, job in list(jobs.items()):
            if job['token'] == token:
                jobs.pop(jid, None)
        remove_private(session['root'])
    return {'deleted': True}


# A production React build makes local UI + model one same-origin application.
build = ROOT.parent / 'build'
if build.is_dir():
    app.mount('/', StaticFiles(directory=build, html=True), name='frontend')
