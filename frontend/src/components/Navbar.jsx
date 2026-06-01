import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="navbar__brand" aria-label="Squad Pulse home">
        Squad Pulse
      </NavLink>

      <nav className="navbar__links" aria-label="Primary navigation">
        <NavLink
          to="/team"
          className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}
        >
          Team
        </NavLink>
      </nav>
    </header>
  );
}
