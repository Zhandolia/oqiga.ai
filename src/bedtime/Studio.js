import React from "react";
import { Link } from "react-router-dom";
import { passages, previewText } from "./stories";
import { clock } from "./useVoice";
export default function Studio({ v }) {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">THE VOICE THEY KNOW BEST</p>
        <h1>Make it sound like home.</h1>
        <p>
          Three short readings. One familiar voice. Take your time and speak as
          you would at bedtime.
        </p>
      </div>
      <div className="studio-grid">
        <section className="studio-main">
          <div className="studio-step">
            <span>01</span>
            <div>
              <h2>A quiet moment to record</h2>
              <p>
                Use a quiet room, one speaker, and your natural voice. Read each
                passage fully, aiming for at least a minute in total.
              </p>
            </div>
          </div>
          <label className="field">
            Name your voice
            <input
              maxLength="40"
              value={v.name}
              onChange={(e) => v.setName(e.target.value)}
              disabled={!!v.busy}
            />
          </label>
          <label className="consent">
            <input
              type="checkbox"
              checked={v.consent}
              onChange={(e) => v.setConsent(e.target.checked)}
              disabled={!!v.busy || v.recording >= 0}
            />
            I’m an adult recording my own voice, and I agree to use these
            recordings to create my bedtime narration.
          </label>
          {passages.map((passage, index) => (
            <article
              className={`passage ${v.clips[index] ? "collected" : ""}`}
              key={passage.title}
            >
              <div className="passage-head">
                <span>READING 0{index + 1}</span>
                <span>
                  {v.clips[index]
                    ? `${clock(v.clips[index].duration)} recorded`
                    : "About 30 seconds"}
                </span>
              </div>
              <h3>{passage.title}</h3>
              <p>{passage.text}</p>
              {v.clips[index] && (
                <audio
                  controls
                  src={v.clips[index].url}
                  aria-label={`Listen to reading ${index + 1}`}
                />
              )}
              <div className="record-actions">
                {v.recording === index ? (
                  <button className="record-stop" onClick={v.stop}>
                    ■ Stop recording · {clock(v.elapsed)}
                  </button>
                ) : (
                  <button
                    className="secondary"
                    disabled={v.recording >= 0 || !v.consent || !!v.busy}
                    onClick={() => v.record(index)}
                  >
                    ● {v.clips[index] ? "Record again" : "Read & record"}
                  </button>
                )}
                <label
                  className={`file-label ${!v.consent || v.recording >= 0 || v.busy ? "disabled" : ""}`}
                >
                  Upload audio
                  <input
                    type="file"
                    accept="audio/*"
                    aria-label={`Upload reading ${index + 1}`}
                    disabled={!v.consent || v.recording >= 0 || !!v.busy}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      e.target.value = "";
                      if (file) {
                        try {
                          await v.acceptClip(file, index);
                        } catch (error) {
                          v.setNotice(error.message);
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </article>
          ))}
        </section>
        <aside className="studio-summary">
          <p className="eyebrow">YOUR VOICE, STEP BY STEP</p>
          <h2>
            A little time,
            <br />a familiar sound.
          </h2>
          <div className="time-total">
            {clock(v.total)} <span>/ 1:00 minimum</span>
          </div>
          <progress
            max="60"
            value={Math.min(60, v.total)}
            aria-label="Recorded time"
          />
          <ul className="checklist">
            <li className={v.clips.every(Boolean) ? "done" : ""}>
              Three clear readings
            </li>
            <li className={v.total >= 60 ? "done" : ""}>
              At least 60 seconds collected
            </li>
            <li className={v.preview ? "done" : ""}>
              A generated listening preview
            </li>
            <li className={v.approved ? "done" : ""}>Your approval</li>
          </ul>
          <p className={`service-note ${v.health ? "online" : ""}`}>
            <i />
            {v.health
              ? "Self-hosted studio connected"
              : "Voice studio not connected"}
          </p>
          {!v.health && (
            <p className="small">
              You can record and listen here now. Creating a voice needs the
              self-hosted studio; it isn’t running on this public site.
            </p>
          )}
          <button
            className="primary full"
            disabled={
              !v.complete ||
              !v.consent ||
              !v.health ||
              !!v.busy ||
              v.recording >= 0
            }
            onClick={v.prepare}
          >
            {v.preview ? "Make a new preview" : "Create voice preview"} →
          </button>
          <p className="small">
            Recordings stay in this tab until you create a preview. Then they
            are sent to your connected voice studio. Closing the tab clears
            local recordings.
          </p>
          {v.clips.some(Boolean) && (
            <button
              className="text-button danger"
              disabled={!!v.busy || v.recording >= 0}
              onClick={v.forget}
            >
              Delete voice & recordings
            </button>
          )}
          <details>
            <summary>About the self-hosted studio</summary>
            <p className="small">
              The free setup runs on your own computer. No voice-service
              subscription is required.
            </p>
            <a
              href="https://github.com/Zhandolia/oqiga.ai/blob/main/server/README.md"
              target="_blank"
              rel="noreferrer"
            >
              Owner’s setup guide ↗
            </a>
          </details>
        </aside>
      </div>
      {v.preview && (
        <section className="approval">
          <p className="eyebrow">02 / THE LISTENING CHECK</p>
          <h2>Does this sound like you?</h2>
          <p>{previewText}</p>
          <audio
            controls
            src={v.preview}
            onEnded={() => v.setHeard(true)}
            aria-label="AI-generated voice preview"
          />
          <p className="small">
            AI-generated audio. Check pronunciation, tone, and likeness. More
            recording time alone does not guarantee a closer match.
          </p>
          <button
            className="primary"
            disabled={!v.heard || v.approved || !!v.busy}
            onClick={v.approve}
          >
            {v.approved ? "Voice approved ✓" : "Yes, use this voice"}
          </button>
          {v.approved && (
            <Link className="text-button" to="/">
              Choose a story →
            </Link>
          )}
        </section>
      )}
    </>
  );
}
