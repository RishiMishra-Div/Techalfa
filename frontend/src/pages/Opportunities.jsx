import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import { opportunityCategories } from "../data";

export default function Opportunities() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(params.get("category") || "All opportunities");
  const categories = ["All opportunities", ...opportunityCategories.map(([title]) => title)];
  const visible = useMemo(() => opportunityCategories.filter(([title, description, status]) => (category === "All opportunities" || title === category) && `${title} ${description} ${status}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <main className="page-main"><PageIntro eyebrow="Career and leadership" title="Ways to contribute and grow." description="Explore learning, career and community pathways. Availability and application details are shown when confirmed." />
    <section className="section wrap"><div className="filter-bar"><label className="search-label">Search opportunities<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search opportunities" /></label><label>Category<select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>{visible.length ? <div className="opportunity-grid">{visible.map(([title, description, availability], index) => <article className="opportunity-card" key={title}><span className="opportunity-index">0{index + 1}</span><h2>{title}</h2><p>{description}</p><span className="opportunity-status">{availability}</span><Link className="text-link" to={`/join?interest=${encodeURIComponent(title)}`}>Register interest →</Link></article>)}</div> : <p className="empty-state">No opportunities match your search.</p>}</section>
  </main>;
}
