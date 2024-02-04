import React from "react"
import "../style/Case.css"

export default function Case({description, role, method}) {
    return (
        <div className="case">
            <div className="case--description-div">
                <h1 className="case--description-heading">Project Description</h1>
                <p className="case--description">{description}</p>
            </div>
            <div className="case--details-div">
                <div className="case--role-div">
                    <h2 className="case--role-heading">My Role</h2>
                    <p className="case--role">{role}</p>
                </div>
                <div className="case--method-div">
                    <h2 className="case--method-heading">Methods & Tools</h2>
                    <p className="case--method">{method}</p>
                </div>
            </div>
            <div className="blob"></div>
        </div>
    )
}