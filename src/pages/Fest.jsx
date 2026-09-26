import Icon from "../components/Icon";
import Count from "../components/Count";
import Reveal from "../components/Reveal";


export default function Fest() {
  return (
    <>
<main className="wrap">
        <section className="sec" id="fest">
          <Reveal className="card fest" duration={1500} y={40}>
            <div>
              <span className="tag mono">Flagship Event 2025</span> <span className="mono" style={{ fontSize: 9, color: "#0369a1" }}>Annual National Tech Fest</span>
              <h2>TechAlfa 2.0 Annual Flagship Fest</h2>
              <p className="lead" style={{ fontSize: 14 }}>India's largest collegiate developer gathering uniting 3,000+ passionate engineers, 80+ universities, venture builders, and global tech leaders under one roof.</p>
              <div className="feats"><div><Icon name="trophy" /> ₹5,00,000+ Prize Pool</div><div><Icon name="clock" /> 48-Hour Non-stop Hackathon</div><div><Icon name="mic" /> Keynotes from Industry Architects</div><div><Icon name="users" /> 3,000+ In-person Attendees</div></div>
              <div className="row" style={{ margin: 0 }}><a className="btn p" href="#reg">Register for TechAlfa 2.0 <Icon name="calendar" /></a><a href="#schedule" style={{ fontSize: 12, fontWeight: 600 }}>View Schedule &amp; Tracks ↗</a></div>
            </div>
            <div className="card reg">
              <div className="mono" style={{ fontSize: 8, color: "#0369a1" }}>REGISTRATION CLOSES IN</div>
              <h4>Limited Hacker Slots Remaining</h4>
              <Count />
              <div style={{ fontSize: 10, color: "#64748b", borderTop: "1px solid #e2e8f0", paddingTop: 12, display: "flex", justifyContent: "space-between" }}><span>Venue: Bangalore Tech Arena &amp; Metaverse</span><span className="tag">Hybrid</span></div>
            </div>
          </Reveal>
        </section>
</main>
    </>
  );
}