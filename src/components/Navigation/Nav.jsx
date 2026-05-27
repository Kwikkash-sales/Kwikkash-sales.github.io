// Base Imports
import { Link } from 'react-router';

// CSS
import "./nav.css";

export default function Nav() {
    return (
        <nav className="nav-container">
            <div className="nav-news-scroll">
                <marquee>WELCOME TO KWIK KASH | BEST CLOTHING MARKET IN SOUTHSIDE | FIND EVERYTHING YOU NEED HERE | OPEN 7 DAYS A WEEK | CONTACT TO MAKE AN INQUIRY FOR A ITEM!</marquee>
            </div>
            <div className="nav-content-container">
                <div className="nav-ad-holder">
                    <p>Placeholder AD</p>
                </div>
                <div className="nav-middle-section">
                    <div className="nav-title-container">
                        <h1>KWIK KASH</h1>
                        <p>CLOTHING STORE</p>
                    </div>
                    <p className="nav-quality">★ <i>Quality Clothes</i> at <i>UNBEATABLE Prices!</i> ★</p>
                    <nav className="nav-buttons-container">
                        <Link className="nav-buttons" to="/">Home</Link>
                        <Link className="nav-buttons" to="/contact">Contact Us</Link>
                        <Link className="nav-buttons" to="/Raffle">Raffle</Link>
                    </nav>
                </div>
                <div className="nav-ad-holder">
                    <p>Placeholder AD</p>
                </div>
            </div>
        </nav>
    )
}