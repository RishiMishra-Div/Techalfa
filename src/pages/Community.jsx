import Icon from "../components/Icon";
import { voices } from "../data";
import Reveal from "../components/Reveal";

export default function Community() {
  return (
    <>
<main className="wrap">
        <section className="sec" id="community">
          <Reveal><div className="sh"><div><span className="tag mono">Student Stories</span><h2>Voices of the Next Generation</h2></div><p>Real impact stories from members who transformed their collegiate journeys through TechAlfa.</p></div></Reveal>
          <div className="g3">
            {voices.map(([q, n, r], i) => (
              <Reveal delay={i * 120} key={n}><div className="card pc"><div className="stars">★★★★★</div><p className="q">"{q}"</p><div className="who"><i /><div>{n}<small>{r}</small></div></div></div></Reveal>
            ))}
          </div>
        </section>
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