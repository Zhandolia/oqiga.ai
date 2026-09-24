import React from "react";
import "../style/Header.css";

export default function Header() {
  return (
    <div className="header">
      <div className="header--divs">
        <div className="header--top">
          <img
            className="logo"
            src={process.env.PUBLIC_URL + "/favicon.ico"}
            alt=""
          />
          <h1 className="header--name">OQIGA.AI</h1>
          <h3 className="header--date">MakeHarvard</h3>
        </div>
        <div className="header--bottom">
          <h2 className="header--title">Zhandos & Zhakhangir</h2>
        </div>
        <p className="header--achievement">
          <strong>Third place · MakeHarvard 2024</strong>
          <a
            href="https://seas.harvard.edu/news/day-ai-devices"
            target="_blank"
            rel="noopener noreferrer"
          >
            Featured by Harvard SEAS <span aria-hidden="true">↗</span>
          </a>
        </p>
      </div>
      <div className="header--wrapper" aria-hidden="true">
        <div className="blob"></div>
        <div className="blob blob-two"></div>
        <div className="blob blob-three"></div>
      </div>
    </div>
  );
}
