import React from "react"
import "../style/Navbar.css"
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="navbar">
            <Link className="nav--item" to="/">Home</Link>
            <Link className="nav--item" to="/about">About</Link>
            <Link className="nav--item" to="/story">Story</Link>
        </nav>
    )
}