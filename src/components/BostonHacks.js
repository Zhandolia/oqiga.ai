import React from "react"
import "../style/BostonHacks.css"
import Case from "./Case"
import Step from "./Step"
import Navbar from "./Navbar"
import Footer from "./Footer"
import data from "../static/data.json"
import TopButton from "./TopButton"

export default function BostonHacks() {
    const caseStudy = data[1].caseStudy

    const stepsEl = caseStudy.steps.map(step => {
        return (
            <Step 
                id={step.id}
                title={step.title}
                image={step.image}
                caption={step.caption}
            />
        )
    })

    return (
        <div className="bostonHacks">
            <Navbar />
            <Case
                description={caseStudy.description}
                role={caseStudy.role}
                method={caseStudy.method}
            />
            {stepsEl}
            <TopButton />
            <Footer />
        </div>
    )
}
