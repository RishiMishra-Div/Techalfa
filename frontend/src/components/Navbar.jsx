import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";

const items = [
  ["/", "Home"],
  ["/events", "Events"],
  ["/about", "About Us"],
  ["/team", "Team"],
  ["/partners", "Partners"],
  ["/community", "Community"],
  ["/gallery", "Gallery"],
  ["/contact", "Contact"],
  ["/techalfa-2", "TechAlfa 2.0"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") closeMenu(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  return <header className="site-header"><nav className="nav wrap" aria-label="Main navigation">
    <div className="nav-main">
      <Link to="/" className="brand" aria-label="TechAlfa India home"><img className="brand-image" src="/images/techalfa-logo.jpg" alt="TechAlfa — Technology & Innovation" /></Link>
      <Link className="button button-primary nav-join" to="/join">Join Community <ArrowUpRight size={16} aria-hidden="true" /></Link>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? "Close navigation menu" : "Open navigation menu"} onClick={() => setOpen((value) => !value)}>{open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}</button>
    </div>
    <div className={`nav-links${open ? " is-open" : ""}`} id="primary-navigation">
      {items.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>{label}</NavLink>)}
      <Link className="mobile-join" to="/join" onClick={closeMenu}>Join Community <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </div>
  </nav></header>;
}
