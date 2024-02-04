# import torch
# import torchaudio
# import torch.nn as nn
# import torch.nn.functional as F

# import IPython

# from tortoise.api import TextToSpeech
# from tortoise.utils.audio import load_audio, load_voice, load_voices

# # This will download all the models used by Tortoise from the HuggingFace hub.
# tts = TextToSpeech()

# ######################

# text = "Once upon a time, in a very blustery day in the Hundred Acre Wood, Winnie-the-Pooh was wondering what to do. He decided to use his stoutness exercises to work up an appetite, but as he stretched up high, he remembered his fondness for honey. \"Ah, honey!\" he thought. \"If only I could find a honey tree, then my tumbly wouldn't feel so rumbly.\""

# # Pick a "preset mode" to determine quality. Options: {"ultra_fast", "fast" (default), "standard", "high_quality"}. See docs in api.py
# preset = "fast"

# ######################

# CUSTOM_VOICE_NAME = "martin"

# import os
# from google.colab import files

# custom_voice_folder = f"tortoise/voices/{CUSTOM_VOICE_NAME}"
# for i, file_data in enumerate(files.upload().values()):
#   with open(os.path.join(custom_voice_folder, f'{i}.wav'), 'wb') as f:
#     f.write(file_data)

# ######################

# CUSTOM_VOICE_NAME = "martin"

# import os
# from google.colab import files

# custom_voice_folder = f"tortoise/voices/{CUSTOM_VOICE_NAME}"
# for i, file_data in enumerate(files.upload().values()):
#   with open(os.path.join(custom_voice_folder, f'{i}.wav'), 'wb') as f:
#     f.write(file_data)

# ######################

# voice_samples, conditioning_latents = load_voice(CUSTOM_VOICE_NAME)
# gen = tts.tts_with_preset(text, voice_samples=voice_samples, conditioning_latents=conditioning_latents,
#                           preset=preset)
# torchaudio.save(f'generated-{CUSTOM_VOICE_NAME}.wav', gen.squeeze(0).cpu(), 24000)
# IPython.display.Audio(f'generated-{CUSTOM_VOICE_NAME}.wav')

# ######################

import torch
import torchaudio
from flask import Flask, request, send_file
from tortoise.api import TextToSpeech
from tortoise.utils.audio import load_audio, load_voice, load_voices

app = Flask(__name__)
tts = TextToSpeech()

@app.route('/upload-voice', methods=['POST'])
def upload_voice():
    # Implement logic to handle voice sample upload
    # This could involve saving the file and processing it
    # Return a response indicating success or failure
    return "Voice upload endpoint"

@app.route('/generate-speech', methods=['POST'])
def generate_speech():
    text = request.form.get('text')
    custom_voice_name = "example"  # Adjust based on your application logic
    voice_samples, conditioning_latents = load_voice(custom_voice_name)
    gen = tts.tts_with_preset(text, voice_samples=voice_samples, conditioning_latents=conditioning_latents, preset="fast")
    output_path = f'generated-{custom_voice_name}.wav'
    torchaudio.save(output_path, gen.squeeze(0).cpu(), 24000)
    return send_file(output_path, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)
