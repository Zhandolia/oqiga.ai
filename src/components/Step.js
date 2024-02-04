import React from "react"
import "../style/Step.css"

export default function Step({id, title, image, caption}) {
    return (
        <div className="step">
            <h2 className="step--title">Step {id}: {title}</h2>
            <div className="step--img-div">
                <img className="step--img" src={process.env.PUBLIC_URL + image} alt="" />
            </div>
            <p className="step--caption">{caption}</p>
        </div>
    )
}