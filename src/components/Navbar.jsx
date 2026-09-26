import Icon from "./Icon";
import { NavLink, Link } from "react-router-dom";

const items = [
  ["/", "Home"], ["/about", "About"], ["/events", "Events"],
  ["/techalfa-2", "TechAlfa 2.0"], ["/opportunities", "Opportunities"], ["/community", "Community"],
];

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="wrap">
        <Link to="/" className="logo"><i><Icon name="term" /></i><div>TechAlfa<small>COMMUNITY</small></div></Link>
        <div className="links">
          {items.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
              {label}{to === "/techalfa-2" && <span className="live">LIVE</span>}
            </NavLink>
          ))}
        </div>
        <div className="row" style={{ margin: 0 }}>
          <a className="btn sm mono" href="#signin"><Icon name="chat" /> Sign In</a>
          <Link className="btn p sm" to="/community">Join Community <Icon name="arrow" /></Link>
        </div>
      </div>
    </nav>
  );
}