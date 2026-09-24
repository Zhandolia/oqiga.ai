import React from "react";
import { NavLink } from "react-router-dom";
import "../style/Navbar.css";
export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <NavLink className="nav--item" to="/" end>
        Home
      </NavLink>
      <NavLink className="nav--item" to="/about">
        About
      </NavLink>
      <NavLink className="nav--item" to="/story">
        Story
      </NavLink>
    </nav>
  );
}
