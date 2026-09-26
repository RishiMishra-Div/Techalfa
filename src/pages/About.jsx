import Icon from "../components/Icon";
import { pillars } from "../data";
import Reveal from "../components/Reveal";

export default function About() {
  return (
    <>
<main className="wrap">
        <section className="sec" id="about">
          <Reveal><div className="sh"><div><span className="tag mono">Our Core Pillars</span><h2>Building Tomorrow's Tech Leaders Today</h2></div><p>A full-cycle student ecosystem driving skill mastery, collaborative shipping, and career launchpads.</p></div></Reveal>
          <div className="g3">
            {pillars.map(([ic, tag, t, d, li], i) => (
              <Reveal delay={i * 120} key={t}><div className="card pc"><div className="ic"><Icon name={ic} /></div><span className="tag mono">{tag}</span><h3>{t}</h3><p>{d}</p><ul>{li.map((x) => <li key={x}>{x}</li>)}</ul></div></Reveal>
            ))}
          </div>
        </section>
</main>
    </>
  );
}