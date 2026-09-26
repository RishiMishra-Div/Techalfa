import Icon from "../components/Icon";
import { useState } from "react";
import { events } from "../data";
import Reveal from "../components/Reveal";

const imgs = {
  "TechAlfa Winter Hack 2025": "/images/event1.jpg",
  "Zero to Production with LLMs & Agents": "/images/event2.jpg",
  "System Design & Distributed Scalability": "/images/event3.jpg",
};

export default function Events() {
  const [tab, setTab] = useState("All Events");
  const tabs = ["All Events", "Hackathons", "Workshops", "Guest Lectures", "Tech Fest"];
  const shown = events.filter((e) => tab === "All Events" || e[8] === tab);
  return (
    <>
<main className="wrap">
        <section className="sec" id="events">
          <Reveal><div className="sh"><div><span className="tag mono">Community Calendar</span><h2>Upcoming Events &amp; Hackathons</h2><div className="tabs">{tabs.map((t) => <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div></div><p>Sharpen your skills, win grants, and collaborate with like-minded builders.</p></div></Reveal>
          <div className="g3">
            {shown.map(([, badge, mode, date, t, d, meta, cta], i) => (
              <Reveal delay={i * 120} key={t}><div className="card ev">
                <div className="img" style={{ backgroundImage: `url(${imgs[t]})` }}><span style={{ left: 10 }} className="mono">{badge}</span><span style={{ right: 10 }} className="mono">{mode}</span></div>
                <div className="body"><div className="mono" style={{ fontSize: 10, color: "#0369a1" }}><Icon name="calendar" /> {date}</div><h3>{t}</h3><p>{d}</p>
                  <div className="foot mono"><span>{meta}</span><a className={"btn sm " + (cta === "Save Seat" ? "ind" : cta === "Explore Track" ? "out" : "p")} href="#reg">{cta} <Icon name={cta === "Save Seat" ? "bookmark" : cta === "Explore Track" ? "eye" : "arrow"} /></a></div></div>
              </div></Reveal>
            ))}
          </div>
        </section>
</main>
    </>
  );
}