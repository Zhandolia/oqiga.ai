import React from "react";
import "../style/About.css";
import Footer from "./Footer";

export default function About() {
  return (
    <main className="about">
      <div className="about--wrapper">
        <div className="about--left">
          <img
            className="about--img"
            src={process.env.PUBLIC_URL + "/skazka.jpg"}
            alt="OQIGA.AI logo"
          />
        </div>

        <div className="about--right">
          <h1 className="about--heading">
            <strong>Bringing Science to Life Through Storytelling</strong>
          </h1>
          <p className="about--text">
            At OQIGA.AI, we're passionate about{" "}
            <strong>igniting the spark of curiosity</strong> and knowledge in
            young minds through the power of voice. Our innovative platform is
            designed to transform the way children learn scientific concepts and
            principles, making education an enchanting experience.
          </p>
          <p className="about--text">
            We believe in the unique bond between parents and their children.
            Our web app allows parents to{" "}
            <strong>
              record themselves reading out specially crafted stories
            </strong>{" "}
            that weave scientific laws and formulas into engaging narratives.
            This personal touch adds warmth and familiarity to the learning
            process, making complex ideas more relatable and understandable.
          </p>
          <p className="about--text">
            The self-hosted voice studio uses a parent’s recordings to create an
            AI narration preview. Parents listen and approve the result before
            using it for a story. The public demo offers stories to read;
            parent-voice generation runs on the connected local studio.
          </p>
          <p className="about--text">
            Start with our original science story, Drippy’s Discovery, or choose
            one of five gentle bedtime stories. You can also paste a family
            story or a book passage you have permission to use.
          </p>
          <p className="about--text">
            Recordings stay in your browser until you request a voice preview
            from the local studio. You can delete your recordings and generated
            audio from the Story page. Inactive server sessions are removed
            after one hour while the studio is running; downloaded audio remains
            on your device.
          </p>
          <p className="about--text">
            Our vision is a world where every bedtime story comes with a side of
            discovery, and every lesson is a story waiting to be told.{" "}
            <strong>Learn, Laugh, and Grow Together:</strong> Let's make
            learning an adventure that lasts a lifetime.
          </p>
        </div>

        <div className="blob"></div>
      </div>

      <Footer />
    </main>
  );
}
