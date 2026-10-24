import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import EventCard from "../components/EventCard";
import { events } from "../data";

const filters = ["All events", "Upcoming", "Past", "Hackathons", "Workshops", "Guest Lectures", "Tech Fest"];

export default function Events() {
  const [filter, setFilter] = useState("All events");
  const [search, setSearch] = useState("");
  const visible = useMemo(() => events.filter((event) => {
    const matches = filter === "All events" || (filter === "Upcoming" ? event.status === "upcoming" : filter === "Past" ? event.status === "past" : event.category.toLowerCase() === filter.toLowerCase());
    return matches && `${event.title} ${event.summary} ${event.category}`.toLowerCase().includes(search.toLowerCase());
  }), [filter, search]);
  return <main className="page-main"><PageIntro eyebrow="Community calendar" title="Events that bring ideas to life." description="Explore TechAlfa events and open a listing for the details currently available." />
    <section className="section wrap"><div className="filter-bar"><label className="search-label">Search events<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by event or topic" /></label><label>Show<select value={filter} onChange={(e) => setFilter(e.target.value)}>{filters.map((item) => <option key={item}>{item}</option>)}</select></label></div>{visible.length ? <div className="event-grid">{visible.map((event) => <EventCard event={event} key={event.id} />)}</div> : <div className="empty-state"><h2>No events found</h2><p>Try a different category or search term.</p></div>}<p className="data-note">Dates, registration links and event details are shown only when confirmed.</p></section>
    <section className="section wrap"><div className="callout"><div><span className="eyebrow">Want to get involved?</span><h2>Join the TechAlfa community</h2></div><Link className="button button-primary" to="/join">Register interest →</Link></div></section>
  </main>;
}
