import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ChevronDown, CircleUserRound, GraduationCap, LayoutDashboard, LogOut, Mail, Settings, UserRound } from "lucide-react";
import "./source.css";
import { bootLegacyApp } from "./legacy.js";

const AdminPortal = lazy(() => import("./pages/AdminPortal.jsx"));
const StudentPortal = lazy(() => import("./pages/StudentPortal.jsx"));

const iconDefinitions = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <symbol id="code" viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></symbol>
  <symbol id="cal" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></symbol>
  <symbol id="brief" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="3"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18"/></symbol>
  <symbol id="users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6M16 4.5a3.5 3.5 0 010 7M21.5 20c0-2.6-1.6-4.6-4-5.5"/></symbol>
  <symbol id="spark" viewBox="0 0 24 24"><path d="M12 3l2.2 6.3L21 12l-6.8 2.7L12 21l-2.2-6.3L3 12l6.8-2.7z"/></symbol>
  <symbol id="mic" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></symbol>
  <symbol id="flag" viewBox="0 0 24 24"><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></symbol>
  <symbol id="heart" viewBox="0 0 24 24"><path d="M12 20s-8-4.6-8-10.5A4.5 4.5 0 0112 7a4.5 4.5 0 018 2.5C20 15.4 12 20 12 20z"/></symbol>
  <symbol id="build" viewBox="0 0 24 24"><path d="M4 21V9l8-5 8 5v12M9 21v-6h6v6"/></symbol>
  <symbol id="link" viewBox="0 0 24 24"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></symbol>
</defs></svg>`;

export default function App() {
  if (window.location.pathname.startsWith("/admin")) {
    return <Suspense fallback={<div className="admin-loading">Loading admin…</div>}><AdminPortal /></Suspense>;
  }
  if (window.location.pathname.startsWith("/student")) {
    return <Suspense fallback={<div className="student-loading">Loading student portal…</div>}><StudentPortal /></Suspense>;
  }
  return <MarketingApp />;
}

function MarketingApp() {
  useEffect(() => {
    bootLegacyApp();
  }, []);

  return <>
    <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconDefinitions }} />
    <header><div className="w nav">
      <a className="logo" href="#/" aria-label="TechAlfa India home"><img className="brand-image" src="/images/techalfa-logo.png" alt="TechAlfa — Technology & Innovation" /></a>
      <nav className="links" id="links" aria-label="Main" />
      <div className="nav-actions" aria-label="Quick links">
        <a className="btn nav-contact" href="#/contact"><Mail size={15} aria-hidden="true" /><span>Contact</span></a>
        <StudentAccountMenu />
      </div>
      <button className="burger" id="bg" aria-label="Menu" aria-expanded="false"><svg className="i" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>
    </div></header>
    <div id="sp" aria-hidden="true" />
    <main id="app" />
    <footer><div className="w"><div className="fg">
      <div><a className="logo" href="#/" aria-label="TechAlfa India home"><img className="brand-image footer-brand-image" src="/images/techalfa-logo.png" alt="TechAlfa — Technology & Innovation" /></a><p style={{ fontSize: ".92rem" }}>Empowering students through technology, innovation and opportunities.</p></div>
      <div><h3>Quick Links</h3><a href="#/about">About</a><a href="#/events">Events</a><a href="#/opportunities">Opportunities</a><a href="#/community">Community</a></div>
      <div><h3>Explore</h3><a href="#/gallery">Gallery</a><a href="#/resources">Resources</a><a href="#/team">Team</a><a href="#/partners">Partners</a><a href="/student">Student Portal</a><a href="#/contact">Contact</a></div>
      <div><h3>Connect</h3><div className="footer-social-links" role="group" aria-label="TechAlfa social media">
        <a className="social-icon-link" href="https://www.instagram.com/techalfa_?srtk=OGJhNXo1aGdndDlv" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><img src="/images/social/instagram.jpg" alt="" /></a>
        <a className="social-icon-link" href="https://www.linkedin.com/company/techalfa-india" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><img src="/images/social/linkedin.png" alt="" /></a>
        <a className="social-icon-link" href="https://www.youtube.com/@TechAlfaIndia" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><img src="/images/social/youtube.png" alt="" /></a>
      </div><span className="social-pending">WhatsApp · coming soon</span><a className="btn s" href="/admin/login" style={{ marginTop: 10, width: "fit-content" }}>Admin Login</a></div>
    </div><div className="copy"><span>© 2026 TechAlfa India. All rights reserved.</span><span><a href="#/contact" style={{ display: "inline", marginRight: 16 }}>Privacy Policy</a><a href="#/contact" style={{ display: "inline" }}>Terms &amp; Conditions</a></span></div></div></footer>
    <div className="lb" id="lb" role="dialog" aria-label="Image viewer"><div id="lbi" /></div>
  </>;
}

function StudentAccountMenu() {
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const [student, setStudent] = useState(null);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef(null);
  const returnPath = `${window.location.pathname}${window.location.hash}`;
  const portalHref = `/student?returnTo=${encodeURIComponent(returnPath.startsWith("/student") ? "/" : returnPath || "/")}`;

  useEffect(() => {
    let active = true;
    fetch(`${apiBase}/api/students/me`, { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active) setStudent(data?.student || null); })
      .catch(() => { if (active) setStudent(null); })
      .finally(() => { if (active) setChecked(true); });
    return () => { active = false; };
  }, [apiBase]);

  useEffect(() => {
    const dismiss = (event) => { if (!menuRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

  const logout = async () => {
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/students/logout`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error("Sign out failed. Please try again.");
      setStudent(null);
      setOpen(false);
    } catch (exception) { setError(exception.message || "Sign out failed."); }
  };

  if (!checked) return <span className="nav-account-loading" aria-label="Checking student session"><UserRound size={17} /></span>;
  if (!student) return <a className="btn p nav-student" href={portalHref}><GraduationCap size={16} aria-hidden="true" /><span>Student Portal</span></a>;

  return <div className="nav-account" ref={menuRef}>
    <button className="nav-account-trigger" aria-haspopup="menu" aria-expanded={open} onClick={() => { setOpen(!open); setError(""); }}>
      <span className="nav-account-avatar">{student.avatarUrl ? <img src={`${apiBase}${student.avatarUrl}`} alt="" crossOrigin="use-credentials" /> : <UserRound size={17} />}</span><span className="nav-account-name">{student.name.split(" ")[0]}</span><ChevronDown className={open ? "turned" : ""} size={14} />
    </button>
    {open && <div className="nav-account-menu" role="menu">
      <div className="nav-account-summary"><strong>{student.name}</strong><span>{student.email}</span><small>{student.college}</small></div>
      <a role="menuitem" href="/student"><LayoutDashboard size={16} />Dashboard</a>
      <a role="menuitem" href="/student?view=profile"><CircleUserRound size={16} />Profile</a>
      <a role="menuitem" href="/student?view=settings"><Settings size={16} />Settings</a>
      {error && <div className="nav-account-error" role="alert">{error}</div>}
      <button role="menuitem" onClick={logout}><LogOut size={16} />Log out</button>
    </div>}
  </div>;
}
