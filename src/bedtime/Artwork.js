import React from "react";
export function Moon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M29 7a15 15 0 1 0 4 23A14 14 0 0 1 29 7Z" fill="currentColor" />
      <path
        d="m31 13 1.2 3.7L36 18l-3.8 1.2L31 23l-1.2-3.8L26 18l3.8-1.3Z"
        fill="currentColor"
      />
    </svg>
  );
}
export function Cover({ story, large = false }) {
  return (
    <div
      className={`cover ${story.color} ${large ? "large" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 300 245">
        <circle cx="215" cy="57" r="27" fill="#fff7d6" />
        <circle cx="225" cy="46" r="25" fill="var(--cover)" />
        <g fill="#fff9df">
          <circle cx="54" cy="48" r="2" />
          <circle cx="159" cy="32" r="2" />
          <path d="m115 59 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
          <circle cx="254" cy="108" r="2" />
        </g>
        <path
          d="M-20 191Q52 125 150 183T330 171V270H-20Z"
          fill="var(--hill)"
          opacity=".5"
        />
        <path d="M-20 220Q82 163 168 219T320 206V270H-20Z" fill="var(--hill)" />
        {story.motif === "moon" && (
          <g fill="#fbf6e8">
            <ellipse cx="134" cy="197" rx="25" ry="29" />
            <ellipse cx="128" cy="166" rx="19" ry="18" />
            <ellipse
              cx="117"
              cy="144"
              rx="7"
              ry="24"
              transform="rotate(-10 117 144)"
            />
            <ellipse
              cx="135"
              cy="141"
              rx="7"
              ry="24"
              transform="rotate(7 135 141)"
            />
            <circle cx="151" cy="204" r="10" />
            <circle cx="121" cy="164" r="2" fill="#515d4d" />
          </g>
        )}
        {story.motif === "cloud" && (
          <g fill="#f8f3f6">
            <path d="M65 148a26 26 0 0 1 21-44 34 34 0 0 1 64-3 27 27 0 0 1 32 46Z" />
            <path d="M122 210v-36l27-21 27 21v36z" fill="#f5e4d1" />
            <path
              d="m116 176 33-27 34 27"
              stroke="#777789"
              strokeWidth="6"
              fill="none"
            />
            <path d="M143 185h14v25h-14z" fill="#ffdc90" />
          </g>
        )}
        {story.motif === "forest" && (
          <>
            <path d="M60 214V86M232 216V115" stroke="#63694f" strokeWidth="7" />
            <path d="m60 80-34 84h68zM232 108l-29 74h58z" fill="#879273" />
            <g fill="#bf714e">
              <path d="M116 215q-1-35 30-35l12-25 7 26q22 36-5 43z" />
              <path d="M114 214q-35 6-22-28l25 13z" />
            </g>
            <path d="m154 183 17 9-13 8z" fill="#fff2d4" />
            <circle cx="161" cy="182" r="2" fill="#4d5143" />
            <circle cx="182" cy="144" r="4" fill="#fff2a1" />
          </>
        )}
        {story.motif === "boat" && (
          <>
            <path d="M98 173h103l-18 26h-66z" fill="#eee4ce" />
            <path d="M151 172V98l45 66h-45z" fill="#faf5e8" />
            <path d="M144 115v49h-34z" fill="#d6dbd2" />
            <path
              d="M50 211q20 8 40 0m26 12q20 8 40 0m43-10q20 8 40 0"
              fill="none"
              stroke="#e9efeb"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}
        {story.motif === "garden" && (
          <g stroke="#657958" strokeWidth="4" fill="none">
            <path d="M102 231V129m50 100V162m45 65V135" />
            <path
              d="M102 189q-34-5-28-24 26 0 28 24Zm0-31q27-3 23-23-23 0-23 23ZM152 196q-22 0-22-20 24 0 22 20Z"
              fill="#8d9d76"
            />
            <g fill="#f8efcf" stroke="none">
              <circle cx="101" cy="122" r="18" />
              <circle cx="197" cy="129" r="17" />
              <circle cx="152" cy="155" r="12" />
            </g>
            <g fill="#c6a46e" stroke="none">
              <circle cx="101" cy="122" r="7" />
              <circle cx="197" cy="129" r="6" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
