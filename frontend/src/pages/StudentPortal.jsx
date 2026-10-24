import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Check, ChevronRight, CircleUserRound, GraduationCap, KeyRound, LayoutDashboard, LogOut, Menu, Save, Settings, ShieldCheck, Users, X } from "lucide-react";
import "../student.css";

const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const avatarSrc = (url) => url ? `${apiBase}${url}` : "";
const api = async (path, options = {}) => {
  const response = await fetch(`${apiBase}/api/students${path}`, { credentials: "include", ...options, headers: { ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(options.headers || {}) } });
  const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The request could not be completed.");
  return data;
};
const date = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Date to be announced";
const today = () => { const value = new Date(); return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`; };
const isPastEvent = (event) => event?.status === "Completed" || Boolean(event?.date && String(event.date).slice(0, 10) < today());
const requestedView = new URLSearchParams(window.location.search).get("view");
const initialView = ["profile", "settings"].includes(requestedView) ? requestedView : "overview";
const navigation = [["overview", "Dashboard", LayoutDashboard], ["events", "My events", CalendarDays], ["profile", "Profile", CircleUserRound], ["settings", "Settings", Settings]];
const initialForm = { name: "", email: "", college: "", password: "" };

export default function StudentPortal() {
  const [student, setStudent] = useState(null);
  const [mode, setMode] = useState("login");
  const [view, setView] = useState(initialView);
  const [form, setForm] = useState(initialForm);
  const [profile, setProfile] = useState({});
  const [registrations, setRegistrations] = useState([]);
  const [eventsFilter, setEventsFilter] = useState("upcoming");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const loadPortal = useCallback(async () => {
    try {
      const me = await api("/me");
      setStudent(me.student);
      setProfile({ ...me.student, skills: (me.student.skills || []).join(", ") });
      const registrationData = await api("/registrations");
      setRegistrations(registrationData.registrations || []);
    } catch (e) { if (!/sign in/i.test(e.message)) setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPortal(); }, [loadPortal]);

  const submitAuth = async (event) => {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    try {
      const data = await api(mode === "register" ? "/register" : "/login", { method: "POST", body: JSON.stringify(form) });
      setStudent(data.student); setProfile({ ...data.student, skills: (data.student.skills || []).join(", ") });
      setNotice(data.message || "You are signed in."); setForm(initialForm);
      const registrationData = await api("/registrations"); setRegistrations(registrationData.registrations || []);
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      if (returnTo?.startsWith("/") && !returnTo.startsWith("//") && new URL(returnTo, window.location.origin).origin === window.location.origin) window.location.assign(returnTo);
      else window.location.assign("/");
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const saveProfile = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const payload = { ...profile, skills: String(profile.skills || "").split(",").map((item) => item.trim()).filter(Boolean) };
    try { const data = await api("/profile", { method: "PUT", body: JSON.stringify(payload) }); setStudent(data.student); setProfile({ ...data.student, skills: (data.student.skills || []).join(", ") }); setNotice("Your profile has been saved."); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 4 * 1024 * 1024) { setError("Choose a JPEG, PNG, or WebP image up to 4 MB."); return; }
    setAvatarBusy(true); setError(""); setNotice("");
    try { const data = await api("/avatar", { method: "PUT", body: file, headers: { "Content-Type": file.type } }); setStudent(data.student); setProfile((current) => ({ ...current, avatarUrl: data.student.avatarUrl })); setNotice("Your profile photo has been updated."); }
    catch (e) { setError(e.message); }
    finally { setAvatarBusy(false); }
  };

  const changePassword = async (event) => {
    event.preventDefault(); setError(""); setNotice("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setError("The new passwords do not match."); return; }
    setBusy(true);
    try {
      const data = await api("/password", { method: "PUT", body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }) });
      setNotice(data.message); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const logout = async () => { try { await api("/logout", { method: "POST" }); } catch {} setStudent(null); setRegistrations([]); setView("overview"); setNotice("You have signed out."); };
  const upcomingRegistrations = registrations.filter((item) => !isPastEvent(item.event));
  const pastRegistrations = registrations.filter((item) => isPastEvent(item.event));

  if (loading) return <div className="student-loading"><img className="student-brand-image" src="/images/techalfa-logo.png" alt="TechAlfa" /><p>Opening your student portal…</p></div>;
  if (!student) return <div className="student-auth-page">
    <a className="student-brand" href="/"><img className="student-brand-image" src="/images/techalfa-logo.png" alt="" /><span>TechAlfa <b>India</b></span></a>
    <div className="student-auth-card">
      <div className="student-eyebrow"><ShieldCheck size={16} /> YOUR STUDENT SPACE</div>
      <h1>{mode === "login" ? <>Welcome <span>back.</span></> : <>Make room for <span>what’s next.</span></>}</h1>
      <p className="student-muted">{mode === "login" ? "Sign in to manage your profile and event registrations." : "Create an account to register for events and keep your TechAlfa activity in one place."}</p>
      <div className="student-auth-tabs"><button className={mode === "login" ? "selected" : ""} onClick={() => { setMode("login"); setError(""); }}>Sign in</button><button className={mode === "register" ? "selected" : ""} onClick={() => { setMode("register"); setError(""); }}>Create account</button></div>
      {notice && <div className="student-message success"><Check size={17} />{notice}</div>}
      {error && <div className="student-message danger"><X size={17} />{error}</div>}
      <form onSubmit={submitAuth} className="student-form">
        {mode === "register" && <><label>Full name<input required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label><label>College or university<input required minLength={2} maxLength={160} autoComplete="organization" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="Where you study" /></label></>}
        <label>Email address<input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
        <label>Password<input required type="password" minLength={mode === "register" ? 12 : 1} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={mode === "register" ? "At least 12 characters" : "Your password"} /></label>
        {mode === "register" && <small className="student-password-hint">Use at least 12 characters. Your password is stored as a secure hash.</small>}
        <button className="student-primary student-wide" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create my account"}<ArrowRight size={17} /></button>
      </form>
      <a className="student-back" href="/">← Back to website</a>
    </div>
    <div className="student-auth-bottom">A focused space for learning, building, and showing up.</div>
  </div>;

  const firstName = student.name.split(" ")[0];
  return <div className="student-shell">
    <aside className={`student-sidebar ${menuOpen ? "open" : ""}`}>
      <a className="student-brand" href="/"><img className="student-brand-image" src="/images/techalfa-logo.png" alt="" /><span>TechAlfa <b>India</b></span></a>
      <div className="student-side-label">STUDENT SPACE</div>
      <nav>{navigation.map(([id, label, Icon]) => <button key={id} className={view === id ? "active" : ""} onClick={() => { setView(id); setMenuOpen(false); setError(""); }}><Icon size={18} />{label}{id === "events" && registrations.length > 0 && <span className="student-nav-count">{registrations.length}</span>}</button>)}</nav>
      <div className="student-sidebar-bottom"><div className="student-mini-profile"><StudentAvatar student={student} /><div><strong>{student.name}</strong><span>{student.college}</span></div></div><button className="student-signout" onClick={logout}><LogOut size={17} /> Sign out</button><a className="student-site-link" href="/">← Back to website</a></div>
    </aside>
    {menuOpen && <button className="student-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <div className="student-main-wrap"><header className="student-topbar"><button className="student-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation"><Menu /></button><span>Student portal</span><button className="student-top-avatar" onClick={() => setView("profile")} aria-label="Open profile"><StudentAvatar student={student} /></button></header>
      <main className="student-main">
        {notice && <div className="student-message success"><Check size={17} />{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16} /></button></div>}
        {error && <div className="student-message danger"><X size={17} />{error}<button onClick={() => setError("")} aria-label="Dismiss"><X size={16} /></button></div>}
        {view === "overview" && <>
          <div className="student-welcome"><div><span className="student-eyebrow">YOUR STUDENT DASHBOARD</span><h1>Good to see you, <span>{firstName}.</span></h1><p className="student-muted">Keep track of the TechAlfa events you’ve joined and what’s coming up.</p></div><div className="student-welcome-icon"><GraduationCap size={30} /></div></div>
          <div className="student-stats"><article><span className="student-stat-icon cyan"><CalendarDays size={19} /></span><b>{registrations.length}</b><small>Events joined</small></article><article><span className="student-stat-icon violet"><Users size={19} /></span><b>{upcomingRegistrations.length}</b><small>Upcoming</small></article><article><span className="student-stat-icon blue"><Check size={19} /></span><b>{pastRegistrations.length}</b><small>Past events</small></article></div>
          <section className="student-section"><div className="student-section-head"><div><span className="student-eyebrow">YOUR NEXT EVENTS</span><h2>Upcoming participation</h2></div><button className="student-text-link" onClick={() => { setEventsFilter("upcoming"); setView("events"); }}>View events <ChevronRight size={16} /></button></div>
            {upcomingRegistrations.length ? <div className="student-registration-list">{upcomingRegistrations.slice(0, 4).map((item) => <RegistrationRow key={item.id} item={item} />)}</div> : <Empty icon={CalendarDays} title="No upcoming registrations" text="Browse the public events calendar to find your next TechAlfa event." action={() => window.location.assign("/#/events")} actionLabel="Browse website events" />}
          </section>
          {pastRegistrations.length > 0 && <section className="student-section"><div className="student-section-head"><div><span className="student-eyebrow">YOUR EXPERIENCE</span><h2>Past participation</h2></div><button className="student-text-link" onClick={() => { setEventsFilter("past"); setView("events"); }}>View past events <ChevronRight size={16} /></button></div><div className="student-registration-list">{pastRegistrations.slice(0, 3).map((item) => <RegistrationRow key={item.id} item={item} />)}</div></section>}
        </>}
        {view === "events" && <><PageHeading eyebrow="YOUR TECHALFA ACTIVITY" title="My events" description="Events you registered for, including upcoming and completed participation." /><div className="student-filter-tabs"><button className={eventsFilter === "upcoming" ? "selected" : ""} onClick={() => setEventsFilter("upcoming")}>Upcoming <span>{upcomingRegistrations.length}</span></button><button className={eventsFilter === "past" ? "selected" : ""} onClick={() => setEventsFilter("past")}>Past events <span>{pastRegistrations.length}</span></button></div>{(eventsFilter === "upcoming" ? upcomingRegistrations : pastRegistrations).length ? <div className="student-registration-list">{(eventsFilter === "upcoming" ? upcomingRegistrations : pastRegistrations).map((item) => <RegistrationRow key={item.id} item={item} />)}</div> : <Empty icon={CalendarDays} title={eventsFilter === "upcoming" ? "No upcoming events yet" : "No past events yet"} text="Only events you register for appear in this list." />}</>}
        {view === "profile" && <><PageHeading eyebrow="YOUR STUDENT DETAILS" title="Profile" description="Manage the details shown in your student account." /><form className="student-profile-card" onSubmit={saveProfile}><div className="student-profile-top"><StudentAvatar student={student} large /><div><h2>{student.name}</h2><p>{student.email}</p></div><span className="student-secure-chip"><ShieldCheck size={15} /> Private profile</span></div><label className="student-avatar-upload">{avatarBusy ? "Uploading photo..." : "Upload profile photo"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} disabled={avatarBusy} /><small>JPEG, PNG, or WebP - up to 4 MB</small></label><div className="student-profile-grid"><label>Full name<input required value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label><label>College or university<input required value={profile.college || ""} onChange={(e) => setProfile({ ...profile, college: e.target.value })} /></label><label className="span-two">Headline<input value={profile.headline || ""} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} placeholder="e.g. Computer science student and builder" /></label><label>Year of study<input value={profile.year || ""} onChange={(e) => setProfile({ ...profile, year: e.target.value })} placeholder="e.g. 3rd year" /></label><label>City<input value={profile.city || ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="e.g. Nagpur" /></label><label className="span-two">Skills <small>Separate skills with commas</small><input value={profile.skills || ""} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} placeholder="React, Python, UI design" /></label><label>GitHub profile<input type="url" value={profile.github || ""} onChange={(e) => setProfile({ ...profile, github: e.target.value })} placeholder="https://github.com/you" /></label><label>LinkedIn profile<input type="url" value={profile.linkedin || ""} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} placeholder="https://linkedin.com/in/you" /></label></div><div className="student-profile-actions"><span>Your profile is only visible to you.</span><button className="student-primary" disabled={busy}><Save size={16} />{busy ? "Saving…" : "Save profile"}</button></div></form></>}
        {view === "settings" && <><PageHeading eyebrow="ACCOUNT PREFERENCES" title="Settings" description="Manage your sign-in security and account access." /><section className="student-settings-card"><div className="student-settings-title"><span className="student-settings-icon"><KeyRound size={19} /></span><div><h2>Password and security</h2><p>Choose a strong password you don’t use on other sites.</p></div></div><form className="student-settings-form" onSubmit={changePassword}><label>Current password<input required type="password" autoComplete="current-password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} /></label><label>New password<input required minLength={12} type="password" autoComplete="new-password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="At least 12 characters" /></label><label>Confirm new password<input required minLength={12} type="password" autoComplete="new-password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} /></label><small>Changing your password signs out other active sessions.</small><button className="student-primary" disabled={busy}><Save size={16} />{busy ? "Updating…" : "Update password"}</button></form></section><section className="student-settings-card student-account-details"><div className="student-settings-title"><span className="student-settings-icon"><CircleUserRound size={19} /></span><div><h2>Account details</h2><p>Contact details connected to your student account.</p></div></div><dl><div><dt>Email</dt><dd>{student.email}</dd></div><div><dt>College</dt><dd>{student.college}</dd></div><div><dt>Account created</dt><dd>{date(student.createdAt)}</dd></div></dl></section></>}
      </main>
    </div>
  </div>;
}

function StudentAvatar({ student, large = false }) { return <div className={`student-avatar${large ? " large" : ""}`}>{student.avatarUrl ? <img src={avatarSrc(student.avatarUrl)} alt="" crossOrigin="use-credentials" /> : student.name.slice(0, 1).toUpperCase()}</div>; }
function PageHeading({ eyebrow, title, description }) { return <div className="student-page-heading"><span className="student-eyebrow">{eyebrow}</span><h1>{title}</h1><p className="student-muted">{description}</p></div>; }
function RegistrationRow({ item }) { const event = item.event || {}; const past = isPastEvent(event); return <article className="student-registration-row"><div className="student-registration-icon"><CalendarDays size={20} /></div><div className="student-registration-info"><strong>{event.title || "TechAlfa event"}</strong><span>{date(event.date)}{event.place ? ` · ${event.place}` : ""}</span></div><div className="student-registration-code"><small>REGISTRATION ID</small><b>{item.registrationCode}</b></div><span className={past ? "student-past-label" : "student-confirmed"}>{past ? "Past event" : <><Check size={14} /> Registered</>}</span></article>; }
function Empty({ icon: Icon, title, text, action, actionLabel }) { return <div className="student-empty"><span><Icon size={22} /></span><h3>{title}</h3><p>{text}</p>{action && <button className="student-primary" onClick={action}>{actionLabel}<ArrowRight size={16} /></button>}</div>; }
