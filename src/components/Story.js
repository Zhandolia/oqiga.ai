import React, { useState, useEffect } from 'react';
import { ReactMic } from 'react-mic';
import "../style/Story.css"

export default function Story() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioData, setAudioData] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);
    const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);

    const sampleText = [
        "Hello, my name is [Your Name], and today, I'll embark on a fascinating journey through the wonders of the spoken word.",
        "In the calm village, beneath the luminous sky, the joyful birds sang melodiously.",
        "Amazement filled her eyes as she whispered softly, 'What a marvelous world!'",
        "In a stern, commanding tone, he declared, 'We must act now, for time waits for no one.'",
        "Giggling with excitement, the children exclaimed, 'This is the best day ever!'",
        "The quick brown fox jumps over the lazy dog, while the white cat lazily yawns on the warm windowsill.",
        "Zephyrs blow gently through autumn leaves, creating a symphony of colors and sounds.",
        "As twilight descends, the shimmering stars begin their dance across the night sky.",
        "Once upon a time, in a land far away, an ancient castle stood tall against the backdrop of rolling hills.",
        "The aroma of freshly baked bread wafted through the air, inviting passersby to indulge in a warm, comforting treat.",
        "And thus concludes our journey, a tapestry of words woven together, creating a rich tapestry of human experience.",
        "Goodbye, and may our paths cross again in the stories yet to be told.",
    ];

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const speechRecognition = new window.webkitSpeechRecognition();
            speechRecognition.continuous = true;
            speechRecognition.interimResults = true;
            speechRecognition.onresult = (event) => {
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setTranscript((prev) => prev + event.results[i][0].transcript);
                    }
                }
            };
            setRecognition(speechRecognition);
        }
    }, []);

    const startRecording = () => {
        setIsRecording(true);
        recognition?.start();
    };

    const stopRecording = () => {
        setIsRecording(false);
        recognition?.stop();
    };

    const highlightText = () => {
        return sampleText.map((sentence, sentenceIndex) => (
            <p key={sentenceIndex}>
                {sentence.split(' ').map((word, wordIndex) => {
                    const isHighlighted = transcript.includes(word);
                    return <span key={wordIndex} style={{ color: isHighlighted ? 'red' : 'black' }}>{word} </span>;
                })}
            </p>
        ));
    };

    const handleAnalyzeVoice = async () => {
        if (!audioData) {
            alert('No audio data to analyze');
            return;
        }

        try {
            // Fetch the audio blob from the audioData URL
            const audioResponse = await fetch(audioData);
            const audioBlob = await audioResponse.blob();
            const formData = new FormData();
            formData.append('file', audioBlob, 'voice.wav');

            // Post the audio blob to the server
            const response = await fetch('http://localhost:5000/generate-speech', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                // Handle the response, e.g., get the generated audio URL
                const generatedBlob = await response.blob();
                setGeneratedAudioUrl(URL.createObjectURL(generatedBlob));
            } else {
                console.error('Failed to analyze voice');
            }
        } catch (error) {
            console.error('Error during analysis:', error);
        }
    };

    const onData = (recordedBlob) => {
        // Handle real-time visualization of audio data here
    };

    const onStop = async (recordedBlob) => {
        setAudioData(recordedBlob.blobURL);
        await uploadVoice(recordedBlob.blobURL);
    };    

    const uploadVoice = async (audioDataUrl) => {
        try {
            const response = await fetch(audioDataUrl);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append('file', blob, 'voice.wav');
    
            const uploadResponse = await fetch('http://localhost:5000/upload-voice', {
                method: 'POST',
                body: formData,
            });
    
            if (uploadResponse.ok) {
                console.log('Voice uploaded');
                await generateSpeech("Your text for TTS here");
            } else {
                console.error('Upload failed');
            }
        } catch (error) {
            console.error('Error in uploading voice:', error);
        }
    };
    
    const generateSpeech = async (text) => {
        const response = await fetch('http://localhost:5000/generate-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });
    
        if (response.ok) {
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            setGeneratedAudioUrl(audioUrl);
            console.log('Speech generated:', audioUrl);
        } else {
            console.error('Failed to generate speech');
        }
    };    

    const aiStory = [
        "Once upon a time, in the sunny and bustling village of Scienceville, there lived a cheerful little water droplet named Drippy. Drippy was not just any water droplet; he was a curious explorer, always eager to learn new things.",
        
        "And so, Drippy the water droplet and Breezy the wind returned to Scienceville, their minds full of new knowledge. They couldn't wait to share their adventure and the fascinating Law of Conservation of Mass with all their friends.",
        "The end."
      ];

    return (
        <div className="story-container">
            <div className="story-left">
                <h1>Read and Record Your Voice</h1>
                <p>Please read the following text aloud to help us analyze your voice:</p>
                <p>{highlightText()}</p>
                <ReactMic
                    record={isRecording}
                    className="sound-wave"
                    onStop={onStop}
                    strokeColor="#000000"
                    backgroundColor="#FF4081" />
                <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
                <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
                {/* {audioData && <audio src={audioData} controls />} */}
                {audioData && <button onClick={handleAnalyzeVoice}>Analyze</button>}
            </div>
            <div className="story-right">
                <h3>Drippy's Discovery: The Adventure of the Law of Conservation of Mass</h3>
                {aiStory.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
                {generatedAudioUrl && <audio src={generatedAudioUrl} controls />}
            </div>
        </div>
    );
}
