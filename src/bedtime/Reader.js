import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Cover, Moon } from "./Artwork";
import { readingMinutes } from "./stories";
export default function Reader({ story, v }) {
  const setNotice = v.setNotice;
  const [speaking, setSpeaking] = useState(false),
    [speed, setSpeed] = useState(1),
    [sleep, setSleep] = useState(0);
  const audio = useRef(null),
    speechRun = useRef(0);
  const stop = () => {
    speechRun.current++;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    audio.current?.pause();
  };
  useEffect(
    () => () => {
      speechRun.current++;
      window.speechSynthesis?.cancel();
    },
    [],
  );
  useEffect(() => {
    if (!sleep) return;
    const timeout = setTimeout(() => {
      speechRun.current++;
      audio.current?.pause();
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      setSleep(0);
      setNotice("Sleep timer finished. Goodnight.");
    }, sleep * 60000);
    return () => clearTimeout(timeout);
  }, [sleep, setNotice]);
  useEffect(() => {
    if (audio.current) audio.current.playbackRate = speed;
  }, [speed, v.narration]);
  function narrate() {
    if (!window.speechSynthesis) {
      v.setNotice(
        "Your browser does not offer a device narrator. You can still read below.",
      );
      return;
    }
    if (speaking) {
      stop();
      return;
    }
    const text = story.chapters.map((c) => c.text).join("\n\n");
    if (!text.trim()) return;
    stop();
    const run = speechRun.current;
    setSpeaking(true);
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    let index = 0;
    const read = () => {
      if (run !== speechRun.current) return;
      if (index >= sentences.length) {
        setSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(sentences[index++]);
      utterance.rate = speed * 0.9;
      utterance.lang = "en-US";
      utterance.onend = read;
      utterance.onerror = () => {
        if (run === speechRun.current) {
          setSpeaking(false);
          v.setNotice("The device narrator stopped. Try starting it again.");
        }
      };
      window.speechSynthesis.speak(utterance);
    };
    read();
  }
  if (!story)
    return (
      <div className="empty">
        <h1>This story isn’t on the shelf.</h1>
        <Link to="/">Return to the library</Link>
      </div>
    );
  return (
    <>
      <Link className="back-link" to={story.id === "own" ? "/own" : "/"}>
        ← {story.id === "own" ? "Edit your story" : "Back to the bookshelf"}
      </Link>
      <div className="reader-layout">
        <aside className="reader-panel">
          <Cover story={story} large />
          <p className="eyebrow">
            {story.category} · {readingMinutes(story.chapters[0].text)} MIN READ
          </p>
          <h1>{story.title}</h1>
          <p className="small">
            {story.id === "own"
              ? "Your own text"
              : "An original Kindred Moon story"}
          </p>
          <div className="narrator">
            <h3>Choose your narrator</h3>
            {v.approved && v.health ? (
              <>
                <p className="small">{v.name} · Your approved AI voice</p>
                <button
                  className="primary full"
                  disabled={!!v.busy || !story.chapters[0].text.trim()}
                  onClick={() => {
                    stop();
                    v.generate(story);
                  }}
                >
                  Create narration →
                </button>
              </>
            ) : (
              <Link className="secondary full" to="/voice">
                Set up your voice →
              </Link>
            )}
            <button
              className="text-button"
              onClick={narrate}
              disabled={!story.chapters[0].text.trim()}
            >
              {speaking
                ? "■ Stop device narrator"
                : "▷ Listen with device narrator"}
            </button>
            <p className="small">
              Device narration uses a standard browser voice, not your cloned
              voice. Availability depends on your browser.
            </p>
          </div>
          {v.narration?.storyId === story.id && (
            <>
              <audio
                ref={audio}
                controls
                src={v.narration.url}
                aria-label={`${story.title}, AI-generated narration`}
                onPlay={() => {
                  speechRun.current++;
                  window.speechSynthesis?.cancel();
                  setSpeaking(false);
                }}
              />
              <a
                className="text-button"
                href={v.narration.url}
                download="kindred-moon-story.wav"
              >
                Download narration ↓
              </a>
              <p className="small">AI-generated in your approved voice.</p>
            </>
          )}
          <div className="play-options">
            <label>
              Speed
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                <option value="0.8">0.8×</option>
                <option value="1">1×</option>
                <option value="1.15">1.15×</option>
              </select>
            </label>
            <label>
              Sleep timer
              <select
                value={sleep}
                onChange={(e) => setSleep(Number(e.target.value))}
              >
                <option value="0">Off</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="20">20 minutes</option>
              </select>
            </label>
          </div>
        </aside>
        <article className="story-text">
          {story.chapters.map((chapter) => (
            <section key={chapter.title}>
              <p className="eyebrow">SETTLE IN, TAKE YOUR TIME</p>
              <h2>{chapter.title}</h2>
              {chapter.text.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </section>
          ))}
          <div className="the-end">
            <Moon />
            <span>The end. Sweet dreams.</span>
          </div>
        </article>
      </div>
    </>
  );
}
