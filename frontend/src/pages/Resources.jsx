import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import { resources } from "../data";

export default function Resources() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All resources");
  const categories = ["All resources", ...new Set(resources.map((resource) => resource.category))];
  const filtered = useMemo(() => resources.filter((resource) => (category === "All resources" || category === resource.category) && `${resource.title} ${resource.summary} ${resource.category}`.toLowerCase().includes(query.toLowerCase())), [query, category]);
  return <main className="page-main"><PageIntro eyebrow="Student resources" title="Useful ideas for your next step." description="Guides for learning, building projects, and getting more from technology events." />
    <section className="section wrap"><div className="filter-bar"><label className="search-label">Search resources<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try “hackathon”" /></label><label>Category<select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>{filtered.length ? <div className="resource-grid">{filtered.map((resource) => <article className="resource-card" key={resource.id}><span className="eyebrow">{resource.category}</span><h2>{resource.title}</h2><p>{resource.summary}</p><Link className="text-link" to={`/resources/${resource.id}`}>Read guide →</Link></article>)}</div> : <p className="empty-state">No resources match those filters.</p>}</section>
  </main>;
}
