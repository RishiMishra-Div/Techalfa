import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function EventCard({ event }) {
  return <article className="event-card">
    <Link to={`/events/${event.id}`} className="event-card-link" aria-label={`View details for ${event.title}`}>
      {event.cover ? <img loading="lazy" decoding="async" src={event.cover} alt={`${event.title} poster`} /> : <div className="event-art-placeholder"><span>TA / 02</span><small>EVENT VISUAL<br />COMING SOON</small></div>}
      <div className="event-card-content"><div className="event-meta"><span className="event-category">{event.category}</span><span className={`status-pill ${event.status}`}>{event.status === "upcoming" ? "Upcoming" : "Past event"}</span></div><h3>{event.title}</h3><p>{event.dateLabel} <span aria-hidden="true">·</span> {event.location}</p><p>{event.summary}</p><span className="card-link">View details <Icon name="arrow" /></span></div>
    </Link>
  </article>;
}
