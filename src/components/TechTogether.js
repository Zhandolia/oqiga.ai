import React from "react"
import "../style/TechTogether.css"
import Case from "./Case"
import Step from "./Step"
import Navbar from "./Navbar"
import Footer from "./Footer"
import data from "../static/data.json"
import TopButton from "./TopButton"

export default function Cashmate() {
    const caseStudy = data[2].caseStudy

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
        <div className="techtogether">
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