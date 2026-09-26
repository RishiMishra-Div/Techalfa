import Icon from "../components/Icon";
import { Link } from "react-router-dom";
import Count from "../components/Count";
import Reveal from "../components/Reveal";


export default function Home() {
  return (
    <>
      <header className="hero" id="home">
        <div className="wrap">
          <div>
            <span className="pill mono"><Icon name="zap" /> TechAlfa 2.0 Fest Registrations Now Live • 50+ Colleges Onboard <Icon name="chev" /></span>
            <h1>Empowering Students Through <span>Technology &amp; Innovation</span></h1>
            <p className="lead">Join an active collective of 15,000+ student developers, open-source contributors, AI researchers, and tech pioneers building the future across campuses.</p>
            <div className="row">
              <Link className="btn p" to="/community">Join Community <Icon name="userplus" /></Link>
              <Link className="btn" to="/events"><Icon name="calendar" /> Explore Events</Link>
            </div>
            <div className="avatars"><img src="/images/avatars.png" alt="" /><div><b className="mono"><Icon name="check" /> Active Builder Network</b>15,000+ active student builders from 120+ partner colleges</div></div>
          </div>
          <div className="card term">
            <div className="dots"><i /><i /><i /><span className="mono">terminal@techalfa:~$</span><em className="mono">● LIVE v2.4.0</em></div>
            <div className="code mono">
              &gt; npx join-techalfa@latest<br />
              <em>✓ Verified campus ID</em><br />
              <em>✓ Synchronizing 120+ active hacker builds...</em><br />
              <em>✓ Welcome to the TechAlfa Student Collective</em>
            </div>
            <div className="cdbox"><div className="cdh mono"><span>TECHALFA 2.0 FEST COUNTDOWN</span><em>48H Hackathon</em></div>
            <Count />
            <Link className="claim" to="/techalfa-2">Claim Free Student Pass →</Link></div>
          </div>
        </div>
      </header>
<main className="wrap">
        <Reveal as="section" className="card stats">
          {[["15,000+", "ACTIVE MEMBERS", "across India & Asia", "#0a8aa8"], ["120+", "PARTNER COLLEGES", "Autonomous Chapters", "#4338ca"], ["85+", "HACKATHONS HOSTED", "₹50L+ Total Prizes", "#0a8aa8"], ["150+", "WORKSHOPS & BOOTCAMPS", "Industry Mentored", "#4338ca"]].map(([n, l, s, c], i) => (
            <div key={l} style={{ transitionDelay: i * 80 + "ms" }}><b style={{ color: c }}>{n}</b><span>{l}</span><small>{s}</small></div>
          ))}
        </Reveal>
        <section className="sec" id="join">
          <Reveal className="cta">
            <span className="pill mono">● Join 15,000+ Student Builders</span>
            <h2>Ready to build, learn, and grow with the brightest innovators?</h2>
            <p>Instant access to hackathon channels, project matchmaking, weekly paper reading groups, and direct internship drops.</p>
            <div className="row"><a className="btn p" href="#discord"><Icon name="chat" /> Join Discord Server</a><a className="btn" href="#whatsapp"><Icon name="phone" /> Join WhatsApp Community</a></div>
            <div className="fine mono">Free membership • Verified student nodes • Zero spam policy</div>
          </Reveal>
        </section>
</main>
    </>
  );
}