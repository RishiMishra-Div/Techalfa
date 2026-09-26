import Icon from "./Icon";
export default function Footer() {
  return (
      <footer>
        <div className="wrap">
          <div className="fg">
            <div><div className="logo" style={{ color: "#0f172a", marginBottom: 12 }}><i><Icon name="term" /></i>TechAlfa</div>Empowering students through technology and innovation. An autonomous collective bridging academia, hackathons, and high-performance tech industry engineering.<div className="soc">{["code","chat","phone","users"].map((n) => <i key={n}><Icon name={n} /></i>)}</div></div>
            <div><h5 className="mono">NAVIGATION</h5><ul><li>About Us</li><li>TechAlfa 2.0 Fest</li><li>Events Archive</li><li>Student Grants</li><li>Discord Server</li></ul></div>
            <div><h5 className="mono">PROGRAMS</h5><ul><li>Campus Chapters</li><li>Internship Cohort</li><li>OpenSource Labs</li><li>Code of Conduct</li><li>Privacy Policy</li></ul></div>
            <div><h5 className="mono">STAY IN THE LOOP</h5>Subscribe to our weekly curated student tech drops, hackathon releases, and bounty updates.<div className="sub"><input placeholder="student@college.edu" /><button className="btn p sm">Subscribe</button></div></div>
          </div>
          <div className="copy"><span>© 2025 TechAlfa Community. Built for builders, engineers, and researchers.</span><span><a href="#privacy">Privacy Policy</a><a href="#terms">Terms of Service</a><a href="#conduct">Code of Conduct</a></span></div>
        </div>
      </footer>
  );
}