import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import Story from "./components/Story";
import Navbar from "./components/Navbar";
import useVoice from "./bedtime/useVoice";
import "./style/App.css";

export default function App() {
  const voice = useVoice(),
    location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/story" element={<Story voice={voice} />} />
        <Route path="/voice" element={<Story voice={voice} />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}
