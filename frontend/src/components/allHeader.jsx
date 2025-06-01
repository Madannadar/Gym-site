import React from "react";



export default function AllHeader({ title, logo }) {
  return (
    <nav className="navbar bg-body-tertiary">
      <div className="container">
        <div className="d-flex align-items-center py-1">
          {/* Back Icon */}
          <div className="leaderboardBack me-2">
            {/* Your SVG here */}
          </div>

          {/* Logo */}
          <div className="mx-2 mx-md-3 mx-lg-4">{logo}</div>

          {/* Title */}
          <div className="leaderboardTitle">
            <h2 className="m-1">{title}</h2>
          </div>
        </div>

        {/* Navbar toggler and links */}
        <button className="navbar-toggler" aria-controls="basic-navbar-nav">
          {/* Icon or text for toggle */}
        </button>

        <div id="basic-navbar-nav" className="navbar-collapse">
          <ul className="nav me-auto">
            <li className="nav-item">
              <a href="/events" className="nav-link">Fitness Events</a>
            </li>
            <li className="nav-item">
              <a href="/leaderboard" className="nav-link">Leaderboard</a>
            </li>
            <li className="nav-item">
              <a href="/bmi" className="nav-link">BMI Calculator</a>
            </li>
            <li className="nav-item dropdown">
              <button className="dropdown-toggle">Dropdown</button>
              <ul className="dropdown-menu">
                <li><a href="#action/3.1" className="dropdown-item">Action</a></li>
                <li><a href="#action/3.2" className="dropdown-item">Another action</a></li>
                <li><a href="#action/3.3" className="dropdown-item">Something</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a href="#action/3.4" className="dropdown-item">Separated link</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
