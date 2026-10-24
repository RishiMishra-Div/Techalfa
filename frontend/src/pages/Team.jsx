import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import { team, teamGroups } from "../data";

export default function Team() {
  return <main className="page-main"><PageIntro eyebrow="People behind TechAlfa" title="A community shaped by its people." description="Meet the students and organizers who help make TechAlfa happen. Profiles will be published as names and approved photos are confirmed." />
    <section className="section wrap team-sections">{teamGroups.map((group) => {
      const members = team.filter((person) => person.group === group || person.role === group);
      return <section className="team-group" key={group}><div className="section-heading"><div><span className="eyebrow">Our people</span><h2>{group}</h2></div></div>{members.length ? <div className="team-grid">{members.map((person) => <article className="team-card" key={person.name}>{person.photo ? <img loading="lazy" src={person.photo} alt={person.name} /> : <div className="team-avatar" aria-hidden="true">{person.name?.slice(0, 1)}</div>}<div><h3>{person.name}</h3><p className="eyebrow">{person.role}</p>{person.intro && <p>{person.intro}</p>}{person.linkedin && <a className="text-link" href={person.linkedin} target="_blank" rel="noreferrer">LinkedIn profile ↗</a>}</div></article>)}</div> : <p className="empty-inline">Verified member names, roles and approved photos for this section are being prepared.</p>}</section>;
    })}<div className="callout"><div><h2>Interested in contributing?</h2><p>Register your interest with TechAlfa.</p></div><Link className="button button-primary" to="/join">Join the community</Link></div></section>
  </main>;
}
