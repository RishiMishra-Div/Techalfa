import Icon from "../components/Icon";
import { career } from "../data";
import Reveal from "../components/Reveal";

export default function Opportunities() {
  return (
    <>
<main className="wrap">
        <section className="sec" id="career">
          <Reveal><div className="sh"><div><span className="tag mono">Career &amp; Leadership</span><h2>Level Up Your Tech Career</h2></div><p>Gain recognized leadership credentials, direct startup employment pathways, and real project experience.</p></div></Reveal>
          <div className="g3">
            {career.map(([ic, tag, t, d, meta, cta], i) => (
              <Reveal delay={i * 120} key={t}><div className="card pc"><div className="ic"><Icon name={ic} /></div><span className="tag mono">{tag}</span><h3>{t}</h3><p>{d}</p>
                <div className="mono" style={{ display: "flex", justifyContent: "space-between", marginTop: 18, fontSize: 9, color: "#64748b" }}><span>{meta}</span><a style={{ color: "#0b7a9e", fontWeight: 600 }} href="#apply">{cta} →</a></div></div></Reveal>
            ))}
          </div>
        </section>
        <section className="sec" style={{ textAlign: "center" }}>
          <Reveal>
          <div className="mono" style={{ fontSize: 9, color: "#64748b", letterSpacing: ".12em" }}>ECOSYSTEM PARTNERS &amp; SPONSORS</div>
          <h3 style={{ margin: "10px 0 20px", fontSize: 16 }}>Supported by Global Tech Leaders &amp; Universities</h3>
          <div className="card sp">{["AWS Educate", "GitHub Campus", "Postman", "MongoDB", "Devfolio", "Polygon Labs"].map((s) => <span key={s}>◈ {s}</span>)}</div>
          </Reveal>
        </section>
</main>
    </>
  );
}