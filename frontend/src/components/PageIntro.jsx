export default function PageIntro({ eyebrow, title, description, actions }) {
  return <section className="page-hero wrap"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="lead">{description}</p>{actions && <div className="button-row">{actions}</div>}</div></section>;
}
