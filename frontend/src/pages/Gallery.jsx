import { useEffect, useState } from "react";
import { galleryItems } from "../data";

const categories = ["All media", "Event Photos", "Videos", "Highlights", "Aftermovies"];

export default function Gallery() {
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState("All media");
  const items = galleryItems.filter((item) => category === "All media" || item.category === category);
  useEffect(() => {
    if (!selected) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selected]);
  return <main className="page-main">
    <section className="page-hero wrap"><span className="eyebrow">Gallery</span><h1>Moments and event artwork.</h1><p className="lead">Browse the event artwork currently available. Event photographs and video recordings have not been provided yet.</p></section>
    <section className="section wrap"><div className="filter-pills" aria-label="Filter gallery">{categories.map((item) => <button type="button" key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>{items.length ? <div className="gallery-grid">{items.map((item) => <article className="gallery-item" key={item.id}>{item.type === "video" ? <video className="gallery-video" controls preload="metadata" src={item.src} aria-label={item.title} poster={item.poster}>{item.title}</video> : <button className="gallery-preview" type="button" onClick={() => setSelected(item)} aria-label={`Preview ${item.title}`}><img loading="lazy" decoding="async" src={item.src} alt={item.title} /></button>}<span className="gallery-caption"><span>{item.category}</span><strong>{item.title}</strong></span></article>)}</div> : <div className="empty-state"><h2>{category} coming soon</h2><p>Approved photos, videos and aftermovies have not been supplied yet.</p></div>}<p className="data-note">The current images are event artwork from the existing site, not documentary event photographs.</p></section>
    {selected && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${selected.title} preview`} onClick={() => setSelected(null)}><button type="button" className="lightbox-close" onClick={() => setSelected(null)} aria-label="Close preview">×</button><figure onClick={(event) => event.stopPropagation()}><img src={selected.src} alt={selected.title} /><figcaption>{selected.title}</figcaption></figure></div>}
  </main>;
}
