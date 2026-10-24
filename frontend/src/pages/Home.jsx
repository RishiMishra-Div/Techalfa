import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Code2, Cpu, Lightbulb, Network, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import EventCard from "../components/EventCard";
import { activities, events } from "../data";

const activityIcons = [Code2, Cpu, CalendarDays, Trophy, Lightbulb, Network];

function HomeHero() {
  const globeRef = useRef(null);

  function moveGlobe(event) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    globeRef.current?.style.setProperty("--pointer-x", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 18}px`);
    globeRef.current?.style.setProperty("--pointer-y", `${((event.clientY - bounds.top) / bounds.height - 0.5) * 18}px`);
  }

  function resetGlobe() {
    globeRef.current?.style.setProperty("--pointer-x", "0px");
    globeRef.current?.style.setProperty("--pointer-y", "0px");
  }

  return <section className="home-hero">
    <div className="home-hero-atmosphere" aria-hidden="true" />
    <div className="home-hero-inner wrap">
      <div className="home-hero-copy">
        <span className="eyebrow"><i className="eyebrow-pulse" /> A student-driven technology community</span>
        <h1>Learn. Build.<br /><span>Compete. Grow.</span></h1>
        <p className="hero-tagline">Empowering Students Through Technology &amp; Innovation</p>
        <p className="lead">A place for curious students to learn together, turn ideas into projects, and take part in hackathons, workshops, competitions and more.</p>
        <div className="button-row">
          <Link className="button button-primary" to="/join">Join Community <ArrowUpRight aria-hidden="true" size={17} /></Link>
          <Link className="button button-ghost" to="/events">Explore Events <ArrowRight aria-hidden="true" size={17} /></Link>
        </div>
        <div className="hero-tags" aria-label="Ways to get involved"><span>LEARN TOGETHER</span><span>BUILD PROJECTS</span><span>MEET MENTORS</span><span>GROW AS A COMMUNITY</span></div>
      </div>
      <div className="home-hero-art" ref={globeRef} onPointerMove={moveGlobe} onPointerLeave={resetGlobe}>
        <div className="globe-light globe-light-cyan" aria-hidden="true" />
        <div className="globe-light globe-light-violet" aria-hidden="true" />
        <div className="globe-composition" aria-hidden="true">
          <div className="globe-orbit globe-orbit-back" /><div className="globe-orbit globe-orbit-side" /><div className="globe-orbit globe-orbit-front" />
          <div className="globe-platform"><span /><i /></div>
          <div className="globe-sphere">
            <div className="globe-meridian meridian-one" /><div className="globe-meridian meridian-two" />
            <div className="globe-latitude latitude-one" /><div className="globe-latitude latitude-two" />
            <svg className="globe-network" viewBox="0 0 360 360" focusable="false">
              <defs><clipPath id="globe-clip"><circle cx="180" cy="180" r="174" /></clipPath><radialGradient id="globe-shade" cx="36%" cy="28%"><stop offset="0" stopColor="#145481" stopOpacity=".48" /><stop offset=".62" stopColor="#071a35" stopOpacity=".14" /><stop offset="1" stopColor="#020916" stopOpacity=".75" /></radialGradient></defs>
              <g clipPath="url(#globe-clip)" fill="none"><circle cx="180" cy="180" r="174" fill="url(#globe-shade)" stroke="none" /><path d="M12 180h336M25 125h310M35 85h290M35 235h290M50 275h260M65 55v250M115 12v336M180 6v348M245 12v336M295 55v250" stroke="#55c9ff" strokeOpacity=".22" strokeWidth=".7" /><path d="M44 109 106 151 151 101 222 137 281 91M58 216l62-33 55 56 72-40 54 36M106 151l14 32 31-82 16 138 55-102 17 94M44 109l14 107M222 137l25 62 34-108M120 183 65 55M175 239l70 97M151 101l94-89M247 199l48 76" stroke="#79dfff" strokeOpacity=".52" strokeWidth="1.1" /><path d="M12 180c45-112 91-168 168-174 77 6 123 62 168 174-45 112-91 168-168 174C103 348 57 292 12 180Z" stroke="#5dc7ff" strokeOpacity=".36" strokeWidth="1" />
                <g fill="#b7f4ff" stroke="#37bcff" strokeWidth="2"><circle cx="106" cy="151" r="4"/><circle cx="151" cy="101" r="4.5"/><circle cx="222" cy="137" r="4"/><circle cx="120" cy="183" r="4"/><circle cx="175" cy="239" r="4.5"/><circle cx="247" cy="199" r="4"/><circle cx="281" cy="91" r="3.5"/><circle cx="58" cy="216" r="3"/></g></g>
            </svg>
            <div className="globe-core-light" />
          </div>
          <span className="globe-particle particle-one" /><span className="globe-particle particle-two" /><span className="globe-particle particle-three" /><span className="globe-particle particle-four" /><span className="globe-particle particle-five" /><span className="globe-particle particle-six" />
        </div>
        <div className="art-note art-note-top"><span className="art-note-icon cyan"><Code2 size={18} /></span><span><strong>Build together</strong><small>Projects, prototypes, practice</small></span></div>
        <div className="art-note art-note-right"><span className="art-note-icon violet"><Users size={18} /></span><span><strong>Find your people</strong><small>Students learning side by side</small></span><ArrowUpRight className="note-arrow" size={14} /></div>
        <div className="art-note art-note-bottom"><span className="art-note-icon blue"><Trophy size={18} /></span><span><strong>Take on a challenge</strong><small>Events made by the community</small></span><ArrowUpRight className="note-arrow" size={14} /></div>
        <span className="art-caption">A COMMUNITY BUILT TO MOVE IDEAS FORWARD</span>
      </div>
    </div>
    <a className="hero-scroll" href="#introduction" aria-label="Scroll to explore"><span>SCROLL TO EXPLORE</span><ArrowDown size={15} /></a>
  </section>;
}

export default function Home() {
  const featuredEvent = events.find((event) => event.id === "techalfa-2");

  return <main>
    <HomeHero />

    <section className="section wrap intro-section" id="introduction">
      <div className="intro-copy"><span className="eyebrow">More than an event calendar</span><h2>Technology is better when we build it together.</h2><p>TechAlfa India is a student-driven community that creates its own spaces to explore technology. Meet peers, learn by doing, and find ways to turn what interests you into something real.</p><p>From your first workshop to a team project or a student-run competition, there is room to learn at every stage.</p><Link className="text-link" to="/about">Get to know TechAlfa <ArrowRight size={16} aria-hidden="true" /></Link></div>
      <div className="intro-visual" aria-hidden="true"><div className="intro-visual-glow" /><div className="intro-step"><span>01</span><strong>Get curious</strong><small>Start with a question</small></div><div className="intro-connector"><i /><i /><i /></div><div className="intro-step featured"><span>02</span><strong>Make something</strong><small>Learn by building</small></div><div className="intro-connector"><i /><i /><i /></div><div className="intro-step"><span>03</span><strong>Share it</strong><small>Grow with your peers</small></div><span className="intro-visual-caption">A COMMUNITY FOR THE NEXT STEP</span></div>
    </section>

    <section className="section wrap activities-section"><div className="section-heading"><div><span className="eyebrow">Find your way in</span><h2>What we do</h2></div><p>Different ways to explore an idea, grow a skill, and get involved with other students.</p></div><div className="activity-grid">{activities.map(([, title, description], index) => { const ActivityIcon = activityIcons[index] || Code2; return <article className="activity-card" key={title}><span className="icon-box"><ActivityIcon size={20} aria-hidden="true" /></span><span className="activity-index">0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>; })}</div></section>

    <section className="section featured-event-section"><div className="wrap"><div className="section-heading"><div><span className="eyebrow">Made by TechAlfa</span><h2>Coming up in our community</h2></div><Link className="text-link" to="/events">Explore all events <ArrowRight size={16} aria-hidden="true" /></Link></div><div className="featured-event-layout"><div className="featured-event-intro"><span className="featured-event-mark">TA<span>/02</span></span><h3>Learn something new. Build something together.</h3><p>Explore TechAlfa’s student-led events, workshops and competitions. New event details are shared as they are confirmed.</p><Link className="text-link" to="/events">See the events calendar <ArrowRight size={16} aria-hidden="true" /></Link></div><div className="featured-event-card">{featuredEvent ? <EventCard event={featuredEvent} /> : <div className="empty-inline">New event announcements are on the way.</div>}</div></div></div></section>

    <section className="section wrap"><div className="community-cta"><div className="community-cta-orbit" aria-hidden="true" /><div className="community-cta-copy"><span className="eyebrow">Your next idea could start here</span><h2>Bring your curiosity.<br /><span>Find your community.</span></h2><p>Meet students who are learning, building and making things happen together.</p></div><div className="community-cta-actions"><Link className="button button-primary" to="/join">Join Community <ArrowUpRight size={17} aria-hidden="true" /></Link><Link className="community-secondary-link" to="/community">More about the community <ArrowRight size={16} aria-hidden="true" /></Link></div></div></section>
  </main>;
}
