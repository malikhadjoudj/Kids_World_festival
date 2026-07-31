import { useState, useEffect } from 'react';
import Button from './Button';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Nos Formules', href: '#formules' },
  { label: 'Comment ça marche', href: '#etapes' },
  { label: 'Pourquoi participer', href: '#avantages' },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="navbar__container container">
        {/* Logo */}
        <a href="#accueil" className="navbar__logo" onClick={closeMenu}>
          <span className="navbar__logo-icon">🌍</span>
          <div className="navbar__logo-text">
            <span className="navbar__logo-name">KIDS WORLD</span>
            <span className="navbar__logo-sub">FESTIVAL</span>
          </div>
        </a>

        {/* Desktop Links */}
        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="navbar__link"
                onClick={closeMenu}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="navbar__links-cta">
            <Button variant="primary" size="sm" href="#formules" onClick={closeMenu}>
              Réserver votre stand
            </Button>
          </li>
        </ul>

        {/* CTA Desktop */}
        <div className="navbar__cta">
          <Button variant="primary" size="sm" href="#formules">
            Réserver votre stand
          </Button>
        </div>

        {/* Mobile burger */}
        <button
          className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`}
          onClick={toggleMenu}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Overlay */}
      {menuOpen && <div className="navbar__overlay" onClick={closeMenu}></div>}
    </nav>
  );
}

export default Navbar;
