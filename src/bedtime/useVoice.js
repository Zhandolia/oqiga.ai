import { useEffect, useRef, useState } from "react";
const base =
  process.env.REACT_APP_VOICE_API_URL ||
  (["localhost", "127.0.0.1"].includes(window.location.hostname) ? "/api" : "");
export const clock = (value) =>
  `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
export default function useVoice() {
  const [health, setHealth] = useState(null),
    [token, setToken] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState("");
  const [clips, setClips] = useState([null, null, null]),
    [recording, setRecording] = useState(-1),
    [elapsed, setElapsed] = useState(0),
    [consent, setConsent] = useState(false),
    [name, setName] = useState("My bedtime voice");
  const [id, setId] = useState(""),
    [approved, setApproved] = useState(false),
    [preview, setPreview] = useState(""),
    [heard, setHeard] = useState(false),
    [narration, setNarration] = useState(null);
  const recorder = useRef(null),
    stream = useRef(null),
    timer = useRef(null),
    urls = useRef(new Set()),
    mounted = useRef(true),
    clipRef = useRef(clips);
  clipRef.current = clips;
  const urlFor = (blob) => {
    const url = URL.createObjectURL(blob);
    urls.current.add(url);
    return url;
  };
  const revoke = (url) => {
    if (url) {
      URL.revokeObjectURL(url);
      urls.current.delete(url);
    }
  };
  async function request(path, options = {}) {
    if (!base)
      throw new Error(
        "The self-hosted voice studio is not connected. You can still record and read here.",
      );
    const response = await fetch(base + path, {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      if (response.status === 401) {
        setToken("");
        setApproved(false);
        setId("");
      }
      let detail;
      try {
        detail = (await response.json()).detail;
      } catch {}
      throw new Error(
        typeof detail === "string"
          ? detail
          : "The voice studio could not complete that request. Please try again.",
      );
    }
    return response;
  }
  useEffect(() => {
    let live = true;
    const check = async () => {
      if (!base) return;
      try {
        const r = await fetch(base + "/health", {
          signal: AbortSignal.timeout(5000),
        });
        if (!r.ok) throw new Error();
        const data = await r.json();
        if (live) setHealth(data);
      } catch {
        if (live) setHealth(null);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => {
      live = false;
      clearInterval(interval);
    };
  }, []);
  useEffect(
    () => () => {
      mounted.current = false;
      stream.current?.getTracks().forEach((t) => t.stop());
      clearInterval(timer.current);
      urls.current.forEach(URL.revokeObjectURL);
    },
    [],
  );
  async function acceptClip(blob, index) {
    if (blob.size > 12 * 1024 * 1024)
      throw new Error("Choose a recording smaller than 12 MB.");
    const context = new (window.AudioContext || window.webkitAudioContext)();
    let decoded;
    try {
      decoded = await context.decodeAudioData(await blob.arrayBuffer());
    } catch {
      throw new Error(
        "This recording could not be read. Try WAV, MP3, or record directly here.",
      );
    } finally {
      await context.close();
    }
    const duration = decoded.duration,
      data = decoded.getChannelData(0);
    let energy = 0,
      clipped = 0;
    for (let i = 0; i < data.length; i++) {
      energy += data[i] * data[i];
      if (Math.abs(data[i]) > 0.995) clipped++;
    }
    if (duration < 15 || duration > 90)
      throw new Error(
        "Use a clear recording between 15 and 90 seconds. Read the full passage at your natural pace.",
      );
    if (Math.sqrt(energy / data.length) < 0.005)
      throw new Error(
        "This recording is too quiet. Move closer to the microphone and try again.",
      );
    if (clipped / data.length > 0.01)
      throw new Error(
        "This recording is distorted. Move a little farther from the microphone and try again.",
      );
    if (!mounted.current) return;
    revoke(clipRef.current[index]?.url);
    const clip = { blob, duration, url: urlFor(blob) };
    setClips((old) => old.map((item, i) => (i === index ? clip : item)));
    revoke(narration?.url);
    setNarration(null);
    setApproved(false);
    setId("");
    revoke(preview);
    setPreview("");
    setHeard(false);
    setNotice(
      `Reading ${index + 1} saved for this visit. Listen back to check the words and background noise.`,
    );
  }
  function stop() {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }
  async function record(index) {
    setNotice("");
    if (!consent) {
      setNotice("Confirm that this is your voice before recording.");
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw new Error(
          "Recording is unavailable in this browser. Upload an audio file instead.",
        );
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find(
        (type) => MediaRecorder.isTypeSupported(type),
      );
      const chunks = [];
      const rec = new MediaRecorder(
        stream.current,
        mime ? { mimeType: mime } : undefined,
      );
      recorder.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = async () => {
        clearInterval(timer.current);
        stream.current?.getTracks().forEach((t) => t.stop());
        setRecording(-1);
        try {
          await acceptClip(new Blob(chunks, { type: rec.mimeType }), index);
        } catch (error) {
          setNotice(error.message);
        }
      };
      rec.onerror = () => {
        setNotice("The microphone stopped responding. Try again.");
        stop();
      };
      rec.start();
      const start = Date.now();
      setElapsed(0);
      setRecording(index);
      timer.current = setInterval(() => {
        const sec = (Date.now() - start) / 1000;
        setElapsed(sec);
        if (sec >= 90 && rec.state === "recording") rec.stop();
      }, 250);
    } catch (error) {
      stream.current?.getTracks().forEach((t) => t.stop());
      setNotice(
        error.name === "NotAllowedError"
          ? "Microphone access was declined. Allow it in your browser or upload a recording."
          : error.message,
      );
    }
  }
  async function poll(jobId, sessionToken) {
    for (let tries = 0; tries < 900; tries++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (!mounted.current) throw new Error("Session closed.");
      const r = await request(`/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const result = await r.json();
      setBusy(result.message || "Preparing audio…");
      if (result.status === "failed")
        throw new Error(result.error || "Audio generation failed.");
      if (result.status === "completed") return result;
    }
    throw new Error(
      "This is taking longer than expected. Check the self-hosted studio and try again.",
    );
  }
  async function prepare() {
    setNotice("");
    setBusy("Checking recordings…");
    try {
      let sessionToken = token;
      if (!sessionToken) {
        sessionToken = (
          await (await request("/sessions", { method: "POST" })).json()
        ).token;
        setToken(sessionToken);
      }
      const form = new FormData();
      clips.forEach((clip, i) =>
        form.append("samples", clip.blob, `reading-${i + 1}.audio`),
      );
      form.append("consent", String(consent));
      form.append("name", name);
      const result = await (
        await request("/voices", {
          method: "POST",
          body: form,
          headers: { Authorization: `Bearer ${sessionToken}` },
        })
      ).json();
      await poll(result.job_id, sessionToken);
      const response = await request(`/voices/${result.voice_id}/preview`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      revoke(preview);
      setPreview(urlFor(await response.blob()));
      setId(result.voice_id);
      setHeard(false);
      setApproved(false);
      setNotice(
        "Preview ready. Listen all the way through, then decide whether it sounds like you.",
      );
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy("");
    }
  }
  async function approve() {
    try {
      await request(`/voices/${id}/approve`, { method: "POST" });
      setApproved(true);
      setNotice("Voice approved. Choose a story when you are ready.");
    } catch (error) {
      setNotice(error.message);
    }
  }
  async function generate(story) {
    setNotice("");
    setBusy("Preparing your story…");
    try {
      const result = await (
        await request("/narrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voice_id: id,
            text: story.chapters.map((c) => c.text).join("\n\n"),
          }),
        })
      ).json();
      await poll(result.job_id, token);
      const response = await request(`/jobs/${result.job_id}/audio`);
      revoke(narration?.url);
      setNarration({ storyId: story.id, url: urlFor(await response.blob()) });
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy("");
    }
  }
  async function forget() {
    if (recording >= 0) stop();
    let message = "Voice and recordings cleared.";
    try {
      if (token) await request("/session", { method: "DELETE" });
    } catch {
      message =
        "Local recordings cleared. The offline studio removes its copy when the session expires.";
    }
    clips.forEach((c) => revoke(c?.url));
    revoke(preview);
    revoke(narration?.url);
    setClips([null, null, null]);
    setApproved(false);
    setId("");
    setPreview("");
    setNarration(null);
    setToken("");
    setHeard(false);
    setConsent(false);
    setNotice(message);
  }
  const total = clips.reduce((sum, clip) => sum + (clip?.duration || 0), 0);
  return {
    health,
    notice,
    setNotice,
    busy,
    clips,
    recording,
    elapsed,
    consent,
    setConsent,
    name,
    setName,
    approved,
    preview,
    heard,
    setHeard,
    narration,
    total,
    complete: clips.every(Boolean) && total >= 60,
    acceptClip,
    record,
    stop,
    prepare,
    approve,
    generate,
    forget,
  };
}
