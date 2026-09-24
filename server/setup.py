"""Create an isolated runtime: python server/setup.py [--cpu]."""
import subprocess
import sys
import venv
from pathlib import Path

root = Path(__file__).resolve().parent
runtime = root / '.venv'
if not (3, 11) <= sys.version_info[:2] <= (3, 12):
    raise SystemExit('Run setup with Python 3.11 or 3.12.')
venv.create(runtime, with_pip=True)
python = runtime / ('Scripts/python.exe' if sys.platform == 'win32' else 'bin/python')
def install(*args):
    subprocess.run([str(python), '-m', 'pip', 'install', *args], check=True)
install('--upgrade', 'pip')
# Chatterbox declares Torch 2.6, which predates RTX 50-series CUDA support.
# Use the tested 2.8/cu128 pair and install the inference package without re-resolving it.
index = 'https://download.pytorch.org/whl/' + ('cpu' if '--cpu' in sys.argv else 'cu128')
install('torch==2.8.0', 'torchaudio==2.8.0', '--index-url', index)
install('--no-deps', 'chatterbox-tts==0.1.7')
install('-r', str(root / 'requirements.txt'))
print('Runtime ready. Build the frontend, then run:', python, root / 'run.py')
