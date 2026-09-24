"""Run the private local studio and built frontend at http://127.0.0.1:8787."""
import os
from pathlib import Path
import uvicorn

if __name__ == '__main__':
    if not (Path(__file__).resolve().parent.parent / 'build/index.html').is_file():
        raise SystemExit('Build the frontend first: npm ci --legacy-peer-deps && npm run build')
    uvicorn.run('app:app', host='127.0.0.1', port=int(os.environ.get('VOICE_PORT', '8787')), app_dir=str(Path(__file__).resolve().parent))
