import React, { useState, useEffect } from 'react';
import { ReactMic } from 'react-mic';
import "../style/Story.css"
import Navbar from './Navbar';

export default function Story() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioData, setAudioData] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);
    const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const snoopDoggAudioUrl = "./audio/snoop-dogg.wav";

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

    const startSnoopDogg = () => {
        // Play the Snoop Dogg audio file here
        const audio = new Audio('/path/to/snoop_dogg_audio.mp3');
        audio.play();

        // Synchronize audio playback with text highlighting
        let currentIndex = 0;
        const highlightInterval = setInterval(() => {
            if (currentIndex < sampleText.length) {
                setHighlightedIndex(currentIndex);
                currentIndex++;
            } else {
                clearInterval(highlightInterval);
                setHighlightedIndex(-1); // Clear highlighting when done
            }
        }, 1000); // Adjust the interval as needed
    };

    const handleAnalyzeVoice = async () => {
        window.location.href = "https://colab.research.google.com/drive/1aIiB3EOwjcKfHUMw05Es0GawQ_sxl_nk#scrollTo=jJnJwv3R9uWT";
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

    const openJupyterNotebook = () => {
        window.open("https://colab.research.google.com/drive/1aIiB3EOwjcKfHUMw05Es0GawQ_sxl_nk#scrollTo=jJnJwv3R9uWT", '_blank');
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
        "One fine morning, Drippy decided to embark on an adventure to understand the mysterious Law of Conservation of Mass. He had heard the wise old Professor Owl mention it and was determined to figure out what it meant.",
        "As Drippy bounced happily along the path, he met his friend Breezy, the gentle wind. \"Where are you off to, Drippy?\" Breezy asked.",
        "\"I'm on a quest to understand the Law of Conservation of Mass!\" Drippy replied excitedly.",
        "Breezy smiled and said, \"That sounds like a grand adventure! Can I join you?\"",
        "Together, they ventured to the lab of Professor Owl, a wise and knowledgeable bird renowned throughout Scienceville. Professor Owl, with his round spectacles perched on his beak, welcomed them warmly.",
        "\"Ah, the Law of Conservation of Mass!\" Professor Owl hooted. \"It's quite simple, really. It means that in any physical change or chemical reaction, mass is conserved. Mass is neither created nor destroyed.\"",
        "Drippy and Breezy looked at each other, a little confused.",
        "\"Let me show you,\" Professor Owl said, and he led them to a small table with a fascinating setup. There was a sealed glass container connected to a scale. Inside the container, there was a small amount of a mysterious-looking substance.",
        "\"This is a special chemical that will change when I heat it,\" explained Professor Owl. \"Watch the scale and see what happens.\"",
        "As Professor Owl gently heated the container, the substance inside started to bubble and change. It turned from a solid to a gas, filling the container with steam. Drippy and Breezy watched in amazement.",
        "\"But look at the scale,\" Professor Owl hooted. \"Even though the substance changed from a solid to a gas, the weight of the container and its contents remained the same!\"",
        "Drippy's eyes widened in realization. \"So, even though the substance changed, the total mass stayed the same?\"",
        "\"Exactly!\" Professor Owl exclaimed. \"That's the Law of Conservation of Mass. No matter how substances within a closed system change form, their total mass remains constant.\"",
        "Drippy and Breezy thanked Professor Owl for his wonderful explanation and set off back to the village, chatting excitedly about what they had learned.",
        "As they walked, Drippy thought about how even though he could evaporate into a cloud and then rain back down, he was always the same amount of water, just in different forms. This new understanding made him appreciate his own journey through the water cycle even more.",
        "And so, Drippy the water droplet and Breezy the wind returned to Scienceville, their minds full of new knowledge. They couldn't wait to share their adventure and the fascinating Law of Conservation of Mass with all their friends.",
        "The end."
    ];

    // const startSnoopDogg = () => {
    //     if (snoopDoggAudioUrl) {
    //         const audio = new Audio(snoopDoggAudioUrl);
    //         audio.play();
    //     }
    // };

    return (
        <div className="story-container">
            <div className="story-left">
                <h1>Read and Record Your Voice</h1>
                <p>Please read the following text aloud to help us analyze your voice:</p>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                    {sampleText.map((paragraph, index) => (
                        <p key={index}>
                            {paragraph.split(' ').map((word, wordIndex) => (
                                <span
                                    key={wordIndex}
                                    style={{
                                        color: highlightedIndex === wordIndex ? 'red' : 'black',
                                    }}
                                >
                                    {word}{' '}
                                </span>
                            ))}
                        </p>
                    ))}
                </div>
                <ReactMic
                    record={isRecording}
                    className="sound-wave"
                    onStop={onStop}
                    strokeColor="#000000"
                    backgroundColor="#FF4081"
                />
                <button onClick={startRecording} disabled={isRecording}>
                    Start Recording
                </button>
                <button onClick={stopRecording} disabled={!isRecording}>
                    Stop Recording
                </button>
                <button onClick={handleAnalyzeVoice}>Analyze</button>
                <a
                    href="https://colab.research.google.com/drive/1aIiB3EOwjcKfHUMw05Es0GawQ_sxl_nk#scrollTo=jJnJwv3R9uWT"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-block',
                        padding: '10px 20px',
                        margin: '10px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: 'white',
                        backgroundColor: '#007bff',
                        border: '1px solid #007bff',
                        borderRadius: '5px',
                        userSelect: 'none', // Prevent text selection
                        outline: 'none' // Remove focus outline
                    }}
                >
                    Jupyter Notebook
                </a>
            </div>
            <div className="story-right">
                <h3>Drippy's Discovery: The Adventure of the Law of Conservation of Mass</h3>
                {aiStory.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
                {generatedAudioUrl && <audio src={generatedAudioUrl} controls />}
                <button onClick={startSnoopDogg}>Snoop Dogg</button>
            </div>
        </div>
    );
    
}
