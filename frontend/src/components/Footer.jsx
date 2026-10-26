import { Link } from "react-router-dom";

const socialLinks = [
  ["Instagram", "https://www.instagram.com/techalfa_?srtk=OGJhNXo1aGdndDlv"],
  ["LinkedIn", "https://www.linkedin.com/company/techalfa-india"],
  ["YouTube", "https://www.youtube.com/@TechAlfaIndia"],
];

export default function Footer() {
  return <footer className="site-footer"><div className="wrap footer-grid">
    <div className="footer-brand"><Link to="/" className="brand" aria-label="TechAlfa India home"><img className="brand-image footer-brand-image" src="/images/techalfa-logo.jpg" alt="TechAlfa — Technology & Innovation" /></Link><p>Empowering Students Through Technology &amp; Innovation</p><div className="footer-contact"><a href="mailto:techalfa2026@gmail.com">techalfa2026@gmail.com</a><a href="tel:+918830079798">+91 88300 79798</a></div></div>
    <div><h2>Quick links</h2><ul><li><Link to="/about">About</Link></li><li><Link to="/events">Events</Link></li><li><Link to="/techalfa-2">TechAlfa 2.0</Link></li><li><Link to="/opportunities">Opportunities</Link></li><li><Link to="/community">Community</Link></li></ul></div>
    <div><h2>Explore</h2><ul><li><Link to="/gallery">Gallery</Link></li><li><Link to="/resources">Resources</Link></li><li><Link to="/team">Team</Link></li><li><Link to="/partners">Partners</Link></li><li><Link to="/contact">Contact</Link></li></ul></div>
    <div><h2>Connect</h2><div className="social-links" aria-label="Social media profile links">{socialLinks.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer">{name}</a>)}<span title="WhatsApp link coming soon">WhatsApp · coming soon</span></div></div>
  </div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} TechAlfa India. All rights reserved.</span><span><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms &amp; Conditions</Link></span></div></footer>;
}
