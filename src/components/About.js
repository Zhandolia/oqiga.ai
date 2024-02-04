import React from "react"
import "../style/About.css"
import Navbar from './Navbar';
import Footer from './Footer';

export default function About() {
    return (
        <div className="about">
            <Navbar />
            <div className="about--wrapper">
                <div className="about--left">
                    <img className="about--img" src={"/skazka.jpg"} alt="logo"/>
                </div>
                
                <div className="about--right">
                    <h1 className="about--heading">
                        <strong>Bringing Science to Life Through Storytelling</strong>
                    </h1>
                    <p className="about--text">
                        At OQIGA.AI, we're passionate about <strong>igniting the spark of curiosity</strong> and knowledge in young minds through the power of voice. Our innovative platform is designed to transform the way children learn scientific concepts and principles, making education an enchanting experience.
                    </p>
                    <p className="about--text">
                        We believe in the unique bond between parents and their children. Our web app allows parents to <strong>record themselves reading out specially crafted stories</strong> that weave scientific laws and formulas into engaging narratives. This personal touch adds warmth and familiarity to the learning process, making complex ideas more relatable and understandable.
                    </p>
                    <p className="about--text">
                        Leveraging the latest advancements in AI voice cloning, we enable the magic to continue even when parents are away. Once a parent records a sample reading, our AI can then narrate any story from our extensive digital library in the parent's voice. It's a way to <strong>be there for the bedtime story, no matter where you are.</strong>
                    </p>
                    <p className="about--text">
                        Each story in our collection is more than just a tale; it's a journey through the wonders of science. From the laws of physics to the mysteries of biology, our stories are meticulously crafted to foster learning in an <strong>enjoyable and memorable way.</strong>
                    </p>
                    <p className="about--text">
                        We prioritize privacy and data security. Your recordings are your own, used solely to create an educational experience for your child. By joining OQIGA.AI, you're not just choosing an educational tool; you're becoming part of a community dedicated to the love of learning and the cherished tradition of storytelling.
                    </p>
                    <p className="about--text">
                        Our vision is a world where every bedtime story comes with a side of discovery, and every lesson is a story waiting to be told. <strong>Learn, Laugh, and Grow Together:</strong> Let's make learning an adventure that lasts a lifetime.
                    </p>
                </div>

                <div className="blob"></div>
            </div>

            <Footer />
        </div>
    )
}