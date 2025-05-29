import React from "react";


import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

export default function AllHeader({ title,logo }) {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
      <div className="d-flex align-items-center py-1">
          {/* Back Icon */}
          <div className="leaderboardBack me-2">
            <svg
              height="25px"
              width="25px"
              xmlns="http://www.w3.org/2000/svg"
              shapeRendering="geometricPrecision"
              textRendering="geometricPrecision"
              imageRendering="optimizeQuality"
              fillRule="evenodd"
              clipRule="evenodd"
              viewBox="0 0 512 404.43"
            >
              <path
                fillRule="nonzero"
                d="m68.69 184.48 443.31.55v34.98l-438.96-.54 173.67 159.15-23.6 25.79L0 199.94 218.6.02l23.6 25.79z"
              />
            </svg>
          </div>

          {/* Logo */}
          <div className="mx-2 mx-md-3 mx-lg-4">
            {logo}
          </div>

          {/* Title */}
          <div className="leaderboardTitle">
            <h2 className="m-1">{title}</h2>
          </div>
        </div>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="custom-toggler bg-transparent border-none rounded-md p-0 focus:outline-none"
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/events">Fitness Events</Nav.Link>
            <Nav.Link href="/leaderboard">Leaderboard</Nav.Link>
            <Nav.Link href="/bmi">BMI Calculator</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
