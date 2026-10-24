import { Link, useParams } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import { resources } from "../data";

export default function ResourceDetails() {
  const { resourceId } = useParams();
  const resource = resources.find((item) => item.id === resourceId);
  if (!resource) return <main className="page-main wrap"><div className="empty-state"><h1>Guide not found</h1><Link className="button button-primary" to="/resources">Browse resources</Link></div></main>;
  return <main className="page-main"><PageIntro eyebrow={resource.category} title={resource.title} description={resource.summary} /><article className="section wrap guide-body">{resource.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}<Link className="text-link" to="/resources">← All resources</Link></article></main>;
}
