import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { stories, readingMinutes } from "./bedtime/stories";
import { Moon, Cover } from "./bedtime/Artwork";
import useVoice from "./bedtime/useVoice";
import Studio from "./bedtime/Studio";
import Reader from "./bedtime/Reader";
import "./bedtime/bedtime.css";
export default function App() {
  const location = useLocation(),
    navigate = useNavigate(),
    v = useVoice();
  const route = location.pathname,
    page = route.startsWith("/read/")
      ? "read"
      : route === "/voice" || route === "/story"
        ? "voice"
        : route === "/own"
          ? "own"
          : "library";
  const [filter, setFilter] = useState("All stories"),
    [query, setQuery] = useState(""),
    [onlySaved, setOnlySaved] = useState(false),
    [saved, setSaved] = useState([]),
    [custom, setCustom] = useState(""),
    [customTitle, setCustomTitle] = useState("Our own story");
  useEffect(() => {
    try {
      const value = JSON.parse(
        localStorage.getItem("kindred-moon-saved") || "[]",
      );
      if (Array.isArray(value)) setSaved(value);
    } catch {}
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);
  function toggleSave(id) {
    const next = saved.includes(id)
      ? saved.filter((item) => item !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem("kindred-moon-saved", JSON.stringify(next));
    } catch {
      v.setNotice("Bookmarks are available for this visit only.");
    }
  }
  const visible = stories.filter(
    (story) =>
      (onlySaved
        ? saved.includes(story.id)
        : filter === "All stories" || story.category === filter) &&
      `${story.title} ${story.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const status = v.approved
    ? "Ready to narrate"
    : v.preview
      ? "Listen & approve"
      : v.complete
        ? "Recordings collected"
        : "Add your voice";
  const activeStory =
    route.split("/")[2] === "own"
      ? {
          id: "own",
          title: customTitle,
          category: "Your story",
          color: "sage",
          motif: "moon",
          chapters: [{ title: customTitle, text: custom }],
        }
      : stories.find((s) => s.id === route.split("/")[2]);
  return (
    <div className="bedtime-app">
      <a
        className="skip"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main").focus();
        }}
      >
        Skip to content
      </a>
      <aside className="sidebar">
        <Link className="brand" to="/">
          <Moon />
          <span>
            kindred<span>moon</span>
          </span>
        </Link>
        <p className="brand-note">
          A familiar voice.
          <br />A softer goodnight.
        </p>
        <nav aria-label="Main navigation">
          <Link
            className={page === "library" || page === "read" ? "active" : ""}
            to="/"
          >
            <span aria-hidden="true">▤</span> Story library
          </Link>
          <Link className={page === "voice" ? "active" : ""} to="/voice">
            <span aria-hidden="true">◉</span> Voice studio
          </Link>
          <Link className={page === "own" ? "active" : ""} to="/own">
            <span aria-hidden="true">✎</span> Your own story
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <Moon />
          <p>
            Little stories.
            <br />
            Lasting closeness.
          </p>
          <span>Previously Oqiga · Made with care</span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>YOUR LITTLE CORNER OF CALM</span>
          <Link className="voice-pill" to="/voice">
            <i className={v.approved ? "ready" : ""} />
            {status}
            <span aria-hidden="true">↗</span>
          </Link>
        </header>
        <main id="main" tabIndex="-1">
          <div className="notice" role="status" hidden={!v.notice}>
            {v.notice}
            <button
              aria-label="Dismiss message"
              onClick={() => v.setNotice("")}
            >
              ×
            </button>
          </div>
          {v.busy && (
            <div className="busy" role="status">
              <span className="spinner" />
              {v.busy}
            </div>
          )}
          {page === "library" && (
            <>
              <section className="welcome">
                <div>
                  <p className="eyebrow">GOOD EVENING, STORYTELLER</p>
                  <h1>
                    A little story.
                    <br />A little closer.
                  </h1>
                  <p>
                    Let their next adventure begin
                    <br className="desktop-break" /> with the voice they know
                    best.
                  </p>
                  <Link className="primary" to="/voice">
                    {v.approved
                      ? "Your voice is ready"
                      : "Create your bedtime voice"}{" "}
                    <span>↗</span>
                  </Link>
                </div>
                <div className="welcome-art">
                  <Cover story={stories[0]} large />
                  <span className="art-note">
                    For all the once-upon-a-times.
                  </span>
                </div>
              </section>
              <div className="library-heading">
                <div>
                  <p className="eyebrow">THE BOOKSHELF</p>
                  <h2>What shall we read tonight?</h2>
                </div>
                <label className="search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    aria-label="Search stories"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Find a little adventure"
                  />
                </label>
              </div>
              <div className="filters" aria-label="Story filters">
                {["All stories", "Dreamy", "Woodland", "Adventure"].map(
                  (label) => (
                    <button
                      key={label}
                      className={
                        filter === label && !onlySaved ? "selected" : ""
                      }
                      onClick={() => {
                        setFilter(label);
                        setOnlySaved(false);
                      }}
                      aria-pressed={filter === label && !onlySaved}
                    >
                      {label}
                    </button>
                  ),
                )}
                <button
                  className={onlySaved ? "selected" : ""}
                  onClick={() => setOnlySaved(!onlySaved)}
                  aria-pressed={onlySaved}
                >
                  ♡ Saved
                </button>
              </div>
              <div className="story-grid">
                {visible.map((story) => (
                  <article className="story-card" key={story.id}>
                    <Link
                      to={`/read/${story.id}`}
                      aria-label={`Read ${story.title}`}
                    >
                      <Cover story={story} />
                    </Link>
                    <div className="card-meta">
                      <span>{story.category}</span>
                      <span>
                        {readingMinutes(story.chapters[0].text)} min read
                      </span>
                    </div>
                    <div className="card-title">
                      <h3>
                        <Link to={`/read/${story.id}`}>{story.title}</Link>
                      </h3>
                      <button
                        className={saved.includes(story.id) ? "saved" : ""}
                        onClick={() => toggleSave(story.id)}
                        aria-label={`${saved.includes(story.id) ? "Unsave" : "Save"} ${story.title}`}
                        aria-pressed={saved.includes(story.id)}
                      >
                        {saved.includes(story.id) ? "♥" : "♡"}
                      </button>
                    </div>
                    <p>{story.description}</p>
                  </article>
                ))}
              </div>
              {!visible.length && (
                <div className="empty">
                  <h3>
                    {onlySaved
                      ? "Your saved shelf is waiting."
                      : "No stories found."}
                  </h3>
                  <p>
                    {onlySaved
                      ? "Tap a heart on a story to keep it here."
                      : "Try another title or clear the filters."}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => {
                      setOnlySaved(false);
                      setFilter("All stories");
                      setQuery("");
                    }}
                  >
                    See all stories →
                  </button>
                </div>
              )}
              <div className="library-note">
                <Moon />
                <p>
                  Five original stories, ready for a quiet evening. Read now,
                  try your device’s narrator, or set up your own voice.
                </p>
              </div>
            </>
          )}
          {page === "voice" && <Studio v={v} />}
          {page === "own" && (
            <>
              <div className="page-heading">
                <p className="eyebrow">YOUR WORDS, THEIR NEXT ADVENTURE</p>
                <h1>A story only you can tell.</h1>
                <p>
                  Paste an original story, a family memory, or a book passage
                  you have permission to use.
                </p>
              </div>
              <form
                className="own-story"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (custom.trim()) navigate("/read/own");
                }}
              >
                <label className="field">
                  Story title
                  <input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    maxLength="100"
                    required
                  />
                </label>
                <label className="field">
                  Your story
                  <textarea
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    maxLength="12000"
                    rows="13"
                    placeholder="Once upon a time…"
                    required
                  />
                </label>
                <div className="form-bottom">
                  <span>
                    {custom.length.toLocaleString()} / 12,000 characters ·{" "}
                    {readingMinutes(custom)} min read
                  </span>
                  <button className="primary" disabled={!custom.trim()}>
                    Open story →
                  </button>
                </div>
                <p className="small">
                  Your text stays in this tab. AI narration sends it to the
                  connected voice studio only when you choose to generate audio.
                </p>
              </form>
            </>
          )}
          {page === "read" && <Reader key={route} story={activeStory} v={v} />}
          <footer>
            <span>
              kindred moon <span className="footer-dot">·</span> Made for the
              moments that matter.
            </span>
            <span>Original stories · Parent-controlled voices</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
