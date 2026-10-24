import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import { communityBenefits } from "../data";

const guidelines = ["Be respectful and welcoming to students at every experience level.", "Share accurate information and give credit to the people who made the work.", "Keep private information private; never post passwords or sensitive personal data.", "Use community spaces to learn, collaborate and support one another."];

export default function Community() {
  return <main className="page-main"><PageIntro eyebrow="TechAlfa community" title="Find your people. Build what matters." description="Meet students who are curious about technology, learn together, and hear about opportunities across the TechAlfa network." actions={<Link className="button button-primary" to="/join">Join the community</Link>} />
    <section className="section wrap"><div className="section-heading"><div><span className="eyebrow">Why join</span><h2>More ways to learn and take part</h2></div></div><div className="activity-grid">{communityBenefits.map((benefit, i) => <article className="activity-card" key={benefit}><span className="opportunity-index">0{i + 1}</span><h3>{benefit}</h3></article>)}</div></section>
    <section className="section wrap"><div className="section-heading"><div><span className="eyebrow">Connect online</span><h2>Community channels</h2></div><p>Official invite links have not been supplied yet. Join by form and the team can share the right channel when available.</p></div><div className="three-grid">{["WhatsApp", "Discord", "College chapters"].map((channel) => <article className="info-card" key={channel}><span className="eyebrow">{channel}</span><h3>Invite link coming soon</h3><p>We’ll add a verified way to join this channel when the organizers provide it.</p><Link className="text-link" to="/join">Register your interest →</Link></article>)}</div></section>
    <section className="section wrap"><div className="section-heading"><div><span className="eyebrow">Our shared space</span><h2>Community guidelines</h2></div></div><div className="story-panel"><ul className="check-list">{guidelines.map((guideline) => <li key={guideline}>{guideline}</li>)}</ul></div></section>
  </main>;
}
