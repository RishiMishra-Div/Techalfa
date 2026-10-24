import { Link, useParams } from "react-router-dom";
import { events } from "../data";

export default function EventDetails() {
  const { eventId } = useParams();
  const event = events.find((item) => item.id === eventId);
  if (!event) return <main className="page-main wrap"><section className="empty-state"><h1>Event not found</h1><p>This event may have been removed or its link may be incorrect.</p><Link className="button button-primary" to="/events">Back to events</Link></section></main>;
  const isPast = event.date && new Date(`${event.endDate || event.date}T23:59:59`) < new Date();

  return (
    <main className="page-main">
      <div className="wrap breadcrumb"><Link to="/events">Events</Link><span aria-hidden="true">/</span><span>{event.title}</span></div>
      <section className="detail-hero wrap"><div className="detail-copy"><span className="eyebrow">{event.category} · {event.date ? (isPast ? "Past event" : "Upcoming event") : "Date not provided"}</span><h1>{event.title}</h1><p className="lead">{event.summary}</p><dl className="event-facts"><div><dt>Date</dt><dd>{event.dateLabel}</dd></div><div><dt>Time</dt><dd>Not provided</dd></div><div><dt>Venue / format</dt><dd>{event.location} · {event.format}</dd></div></dl></div>{event.cover ? <img src={event.cover} alt={`${event.title} event artwork`} /> : <div className="event-cover-empty detail-cover-empty">Event artwork has not been provided for this event.</div>}</section>
      <section className="section wrap detail-content"><article className="detail-section"><span className="eyebrow">About this event</span><h2>Event overview</h2><p>{event.details}</p></article>
        <article className="detail-section"><span className="eyebrow">Highlights</span><h2>What is included</h2><ul className="check-list">{event.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></article>
        <article className="detail-section"><span className="eyebrow">People and outcomes</span><h2>Speakers, teams, and results</h2><p className="empty-inline">Speaker and organizer names, participating team information, and achievements have not been provided for this event.</p></article>
        <article className="detail-section"><span className="eyebrow">Event media</span><h2>Photos</h2>{event.gallery.length ? <div className="gallery-grid">{event.gallery.map((photo) => <img key={photo.src} src={photo.src} alt={photo.alt} />)}</div> : <p className="empty-inline">Event photographs have not been provided yet.</p>}</article>
        <article className="detail-section"><span className="eyebrow">Watch</span><h2>Videos and recordings</h2>{event.videos.length ? event.videos.map((video) => <video key={video.src} controls preload="metadata" src={video.src}>{video.title}</video>) : <p className="empty-inline">No event video or recording is available yet.</p>}</article>
      </section>
      <div className="wrap bottom-link"><Link className="text-link" to="/events">← Back to all events</Link></div>
    </main>
  );
}
