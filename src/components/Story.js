import React, { useEffect, useRef, useState } from "react";
import "../style/Story.css";
import { passages, stories, previewText } from "../bedtime/stories";
import { originalStory } from "../bedtime/originalStory";
import { clock } from "../bedtime/useVoice";
const library = [originalStory, ...stories];
export default function Story({ voice: v }) {
  const [reading, setReading] = useState(0),
    [storyId, setStoryId] = useState("drippy"),
    [custom, setCustom] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const speechRun = useRef(0),
    audio = useRef(null),
    stopRecording = useRef(v.stop);
  stopRecording.current = v.stop;
  useEffect(
    () => () => {
      stopRecording.current();
      speechRun.current++;
      window.speechSynthesis?.cancel();
    },
    [],
  );
  const story =
    storyId === "own"
      ? {
          id: "own:" + custom,
          title: "Your own story",
          chapters: [{ text: custom }],
        }
      : library.find((s) => s.id === storyId);
  function stopNarration() {
    speechRun.current++;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    audio.current?.pause();
  }
  function readWithDevice() {
    if (speaking) {
      stopNarration();
      return;
    }
    if (!window.speechSynthesis) {
      v.setNotice(
        "Device narration is unavailable in this browser. You can still read the story.",
      );
      return;
    }
    stopNarration();
    const run = speechRun.current;
    const sentences =
      story.chapters
        .map((c) => c.text)
        .join("\n\n")
        .match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    let index = 0;
    setSpeaking(true);
    const next = () => {
      if (run !== speechRun.current) return;
      if (index === sentences.length) {
        setSpeaking(false);
        return;
      }
      const speech = new SpeechSynthesisUtterance(sentences[index++]);
      speech.lang = "en-US";
      speech.rate = 0.9;
      speech.onend = next;
      speech.onerror = () => {
        if (run === speechRun.current) {
          setSpeaking(false);
          v.setNotice(
            "The device narrator stopped. Try again in Chrome or Edge.",
          );
        }
      };
      window.speechSynthesis.speak(speech);
    };
    next();
  }
  return (
    <main className="story-page">
      {v.notice && (
        <div className="story-message" role="status">
          <span>{v.notice}</span>
          <button onClick={() => v.setNotice("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}
      {v.busy && (
        <p className="story-message" role="status">
          {v.busy}
        </p>
      )}
      <div className="story-container">
        <section className="story-left" aria-labelledby="record-heading">
          <h1 id="record-heading">Read and Record Your Voice</h1>
          <p>
            Please read the text aloud in your natural voice. Complete three
            short readings, totaling at least one minute.
          </p>
          <label className="voice-consent">
            <input
              type="checkbox"
              checked={v.consent}
              disabled={!!v.busy || v.recording >= 0}
              onChange={(e) => v.setConsent(e.target.checked)}
            />
            I’m an adult recording my own voice, and I agree to create AI
            narration from these recordings.
          </label>
          <label className="story-field">
            Reading
            <select
              value={reading}
              disabled={v.recording >= 0 || !!v.busy}
              onChange={(e) => setReading(Number(e.target.value))}
            >
              {passages.map((p, i) => (
                <option value={i} key={p.title}>
                  {i + 1}. {p.title}
                  {v.clips[i] ? " — recorded" : ""}
                </option>
              ))}
            </select>
          </label>
          <p className="reading-text">{passages[reading].text}</p>
          {v.clips[reading] && (
            <audio
              controls
              src={v.clips[reading].url}
              aria-label={`Your recording for reading ${reading + 1}`}
            />
          )}
          <div className="story-controls">
            <button
              disabled={!v.consent || v.recording >= 0 || !!v.busy}
              onClick={() => v.record(reading)}
            >
              {v.clips[reading] ? "Record Again" : "Start Recording"}
            </button>
            <button disabled={v.recording < 0} onClick={v.stop}>
              Stop Recording{v.recording >= 0 ? ` (${clock(v.elapsed)})` : ""}
            </button>
            <label
              className={`upload-control ${!v.consent || v.recording >= 0 || v.busy ? "disabled" : ""}`}
            >
              Upload Audio
              <input
                type="file"
                accept="audio/*"
                aria-label={`Upload reading ${reading + 1}`}
                disabled={!v.consent || v.recording >= 0 || !!v.busy}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  e.target.value = "";
                  if (file)
                    try {
                      await v.acceptClip(file, reading);
                    } catch (error) {
                      v.setNotice(error.message);
                    }
                }}
              />
            </label>
          </div>
          <p className="story-note">
            {v.clips.filter(Boolean).length} / 3 readings · {clock(v.total)} /
            1:00 minimum. Each reading: 15–90 seconds, up to 12 MB.
          </p>
          <button
            disabled={
              !v.complete ||
              !v.consent ||
              !v.health ||
              !!v.busy ||
              v.recording >= 0
            }
            onClick={v.prepare}
          >
            {v.preview ? "Create New Preview" : "Analyze Voice"}
          </button>
          {!v.health && (
            <p className="story-note">
              AI voice generation needs the{" "}
              <a
                href="https://github.com/Zhandolia/oqiga.ai/blob/main/server/README.md"
                target="_blank"
                rel="noreferrer"
              >
                local voice studio
              </a>
              . This public demo lets you record, read stories, and use your
              device’s standard narrator.
            </p>
          )}
          {v.preview && (
            <div className="voice-preview">
              <h2>Listen to your voice preview</h2>
              <p>{previewText}</p>
              <audio
                controls
                src={v.preview}
                onEnded={() => v.setHeard(true)}
                aria-label="AI voice preview"
              />
              <p className="story-note">
                Listen all the way through. Check tone, pronunciation, and
                likeness before approving.
              </p>
              <button
                disabled={!v.heard || v.approved || !!v.busy}
                onClick={v.approve}
              >
                {v.approved ? "Voice Approved" : "Approve Voice"}
              </button>
            </div>
          )}
          {v.clips.some(Boolean) && (
            <button
              className="plain-button"
              disabled={!!v.busy || v.recording >= 0}
              onClick={v.forget}
            >
              Delete Voice & Recordings
            </button>
          )}
          <p className="story-note">
            Recordings stay in this tab until you select Analyze Voice. Then
            they are sent to your connected local studio. Refreshing or closing
            this tab clears its recordings.
          </p>
        </section>
        <section className="story-right" aria-labelledby="story-heading">
          <label className="story-field">
            Choose a story
            <select
              value={storyId}
              onChange={(e) => {
                stopNarration();
                setStoryId(e.target.value);
              }}
            >
              {library.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.title}
                </option>
              ))}
              <option value="own">Your own story or book passage</option>
            </select>
          </label>
          <h2 id="story-heading">{story.title}</h2>
          {storyId === "own" ? (
            <label className="story-field">
              Paste an original story or a passage you have permission to use
              <textarea
                value={custom}
                maxLength={12000}
                rows={12}
                onChange={(e) => {
                  stopNarration();
                  setCustom(e.target.value);
                }}
              />
              <span className="story-note">
                {custom.length.toLocaleString()} / 12,000 characters
              </span>
            </label>
          ) : (
            story.chapters.map((chapter, i) => (
              <div key={i}>
                {chapter.text.split("\n\n").map((paragraph, j) => (
                  <p key={j}>{paragraph}</p>
                ))}
              </div>
            ))
          )}
          <div className="story-controls">
            <button
              disabled={
                !!v.busy ||
                !v.approved ||
                !v.health ||
                !story.chapters[0].text.trim()
              }
              onClick={() => {
                stopNarration();
                v.generate(story);
              }}
            >
              Read in My Voice
            </button>
            <button
              disabled={!story.chapters[0].text.trim()}
              onClick={readWithDevice}
            >
              {speaking ? "Stop Narrator" : "Listen with Device Narrator"}
            </button>
          </div>
          <p className="story-note">
            Your voice becomes available after you approve a preview. The device
            narrator uses a standard browser voice.
          </p>
          {v.narration?.storyId === story.id && (
            <div>
              <audio
                ref={audio}
                controls
                src={v.narration.url}
                aria-label="AI-generated story narration"
                onPlay={() => {
                  speechRun.current++;
                  window.speechSynthesis?.cancel();
                  setSpeaking(false);
                }}
              />
              <a href={v.narration.url} download="oqiga-story.wav">
                Download Narration
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
