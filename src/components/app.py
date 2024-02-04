import speech_recognition as sr
from flask import Flask, request
from gtts import gTTS

app = Flask(__name__)

@app.route('/')
def home():
    return "Hello, World!"

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'audio' in request.files:
        audio_file = request.files['audio']
        text = transcribe_audio(audio_file)
        response = text_to_speech(text)
        return response
    return "Audio not received"

def transcribe_audio(audio_file):
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file) as source:
        audio_data = recognizer.record(source)
    try:
        text = recognizer.recognize_google(audio_data)
        return text
    except sr.UnknownValueError:
        return "Speech Recognition could not understand audio"
    except sr.RequestError:
        return "Could not request results from the speech recognition service"

def text_to_speech(text, language='en'):
    tts = gTTS(text=text, lang=language)
    filename = 'speech.mp3'
    tts.save(filename)
    return f"Text converted to speech: {filename}"

if __name__ == "__main__":
    app.run(debug=True)
