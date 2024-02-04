import os

import torch
import torchaudio
from flask import Flask, request, send_file
from flask_cors import CORS
from tortoise.api import TextToSpeech
from tortoise.utils.audio import load_audio, load_voice, load_voices

CORS(app)
app = Flask(__name__)
tts = TextToSpeech()
UPLOAD_FOLDER = 'path/to/upload/folder'

@app.route('/upload-voice', methods=['POST'])
def upload_voice():
    custom_voice_name = "martin"
    custom_voice_folder = os.path.join(UPLOAD_FOLDER, f"tortoise/voices/{custom_voice_name}")
    os.makedirs(custom_voice_folder, exist_ok=True)

    for i, file in enumerate(request.files.values()):
        filename = f'{i}.wav'
        filepath = os.path.join(custom_voice_folder, filename)
        file.save(filepath)
    
    return "Voice samples uploaded"

@app.route('/generate-speech', methods=['POST'])
def generate_speech():
    text = request.json.get('text')
    custom_voice_name = "martin"
    voice_samples, conditioning_latents = load_voice(custom_voice_name)
    gen = tts.tts_with_preset(text, voice_samples=voice_samples, conditioning_latents=conditioning_latents, preset="fast")
    output_path = f'generated-{custom_voice_name}.wav'
    torchaudio.save(output_path, gen.squeeze(0).cpu(), 24000)
    
    return send_file(output_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
