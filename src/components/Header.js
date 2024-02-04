import React from "react"
import "../style/Header.css"

export default function Header() {
    return (
        <div className="header">
            <div className="header--divs">
                <div className="header--top">
                <img className="logo" src={"/favicon.ico"} alt="icon"/>
                    <h1 className="header--name">OQIGA.AI</h1>
                    <h3 className="header--date">MakeHarvard</h3>
                </div>
                <div className="header--bottom">
                <h2 className="header--title">Zhandos & Zhakhangir</h2>
                </div>
            </div>
            <div className="header--wrapper">
                <div className="blob"></div>
                <div className="blob blob-two"></div>
                <div className="blob blob-three"></div>
            </div>
        </div>
    )
}