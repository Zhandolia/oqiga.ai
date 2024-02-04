import React from "react"
import "../style/TopButton.css"

export default function TopButton() {
    
    function topFunction() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    return (
        <div className="topButton">
            <button className="topButton--button" onClick={topFunction}>Back to Top</button>
        </div>
    )
}