import React from "react";
import "../style/Experience.css";
import { Link } from "react-router-dom";

export default function Experience({company, description, link, image, caseStudy}) {
    return (
        <div className="experience">
            <div className="exp--left">
                <h1 className="exp--company">{company}</h1>
                <p className="exp--description">{description}</p>
                <Link className="exp--button" to={link}>Read More</Link>
            </div>
            <div className="exp--right">
                <img className="exp--img" src={process.env.PUBLIC_URL + image} alt={`${company} mockup`} />
            </div>
        </div>
    )
}