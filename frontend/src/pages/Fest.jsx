import { Link } from "react-router-dom";
import { events, festivalFaqs } from "../data";

const fest = events.find((event) => event.id === "techalfa-2");
const tracks = ["48-hour hackathon", "Student competitions", "Technical workshops", "Industry talks"];

export default function Fest() {
  return <main className="page-main fest-page">
    <section className="fest-hero wrap"><div><span className="eyebrow"><i className="eyebrow-pulse"/> Flagship technology festival</span><h1>TECHALFA <span>2.0</span></h1><p className="lead">A celebration of technology, innovation and competition—bringing students together to learn, build and connect.</p><p className="availability-note">Event date and registration announcement are coming soon.</p><div className="button-row"><Link className="button button-primary" to="/join">Get event updates</Link><Link className="button button-ghost" to="/contact">Contact organizers</Link></div></div><div className="fest-highlight-art"><span className="fest-ring ring-a"/><span className="fest-ring ring-b"/><b>02</b><small>BUILD / COMPETE / CONNECT</small></div></section>
    <section className="section wrap"><div className="stats-grid"><div className="stat-card"><strong>{fest.format}</strong><span>Format planned</span></div><div className="stat-card"><strong>{fest.location}</strong><span>Venue information</span></div><div className="stat-card"><strong>₹5,00,000+</strong><span>Prize pool listed in the existing project brief</span></div></div><p className="data-note">Final event details and eligibility are subject to the official announcement.</p></section>
    <section className="section wrap"><div className="section-heading"><div><span className="eyebrow">The experience</span><h2>Build. Compete. Connect.</h2></div></div><div className="activity-grid">{tracks.map((title, i) => <article className="activity-card" key={title}><span className="opportunity-index">0{i + 1}</span><h3>{title}</h3><p>Details, rules and timings will be published with the confirmed event schedule.</p></article>)}</div></section>
    <section className="section wrap about-columns"><article className="info-card"><span className="eyebrow">Schedule & speakers</span><h2>Announcement in progress</h2><p>Session times, speaker names, mentors and venue arrangements are not confirmed yet. We’ll publish the full schedule here once it is approved.</p></article><article className="info-card info-card-tint"><span className="eyebrow">Register interest</span><h2>Be first to hear when registration opens.</h2><p>Join the TechAlfa community to receive event updates.</p><Link className="button button-primary" to="/join">Join community</Link></article></section>
    <section className="section wrap"><div className="section-heading"><div><span className="eyebrow">Frequently asked questions</span><h2>Good to know</h2></div></div><div className="faq-list">{festivalFaqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
  </main>;
}
