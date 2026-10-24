import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpen, BriefcaseBusiness, CalendarDays, Cog, LogOut, Mail, Menu, Star, Users } from "lucide-react";
import ContentEditor from "../components/ContentEditor.jsx";
import "../admin.css";

const sections = [
  ["dashboard", "Dashboard", BarChart3], ["events", "Events", CalendarDays],
  ["registrations", "Registrations", Users], ["opportunities", "Opportunities", BriefcaseBusiness], ["resources", "Resources", BookOpen],
  ["reviews", "Reviews", Star], ["messages", "Messages", Mail], ["site-content", "Site Content", Cog],
];
const emptySite = { students: "", events: "", colleges: "", workshops: "", phone: "8830079798", email: "techalfa2026@gmail.com", prize: "" };
const pageFields = [["pageLayout", "Page design", "select", ["feature", "editorial", "showcase"]], ["pageContent", "Page content", "content"]];
const eventFields = [["title", "Title", "text"], ["date", "Date", "date"], ["time", "Event start time (IST)", "optional-time"], ["type", "Type", "select", ["Hackathon", "Workshop", "Guest Lecture", "Tech Fest"]], ["place", "Location", "text"], ["status", "Status", "select", ["Draft", "Open", "Closed", "Completed"]], ["countdownEnabled", "Show countdown hero", "checkbox"], ["registrationUrl", "Registration link", "optional-url"], ["importantInfo", "Important information", "optional-textarea"], ...pageFields];
const opportunityFields = [["title", "Title", "text"], ["cat", "Category", "select", ["Internships", "Workshops", "Campus Ambassador", "Volunteer Opportunities", "College Chapters", "Open Positions"]], ["org", "Organization", "text"], ["deadline", "Deadline", "date"], ["status", "Status", "select", ["Draft", "Live", "Closed"]], ...pageFields];
const resourceFields = [["title", "Title", "text"], ["category", "Category", "select", ["Student Resources", "Technology Articles", "AI & Data Science", "Career Guidance", "Event Updates"]], ["summary", "Summary", "text"], ["status", "Status", "select", ["Draft", "Live"]], ...pageFields];

function legacyPageContent(value) {
  if (value?.type === "doc") return value;
  const paragraphs = String(value || "").split(/\r?\n+/).map((text) => text.trim()).filter(Boolean);
  return { type: "doc", content: paragraphs.length ? paragraphs.map((text) => ({ type: "paragraph", content: [{ type: "text", text }] })) : [{ type: "paragraph" }] };
}

function parseFaqImport(source) {
  const text = String(source || "").trim();
  if (!text) throw new Error("Paste FAQ text or choose a CSV file first.");
  if (new TextEncoder().encode(text).length > 180_000) throw new Error("Keep each import under 180 KB; split larger files into batches.");
  let rows = [];
  const labeled = /^(?:q|question)(?:\s*\d+)?\s*[:ï¼š]/im.test(text) && /^(?:a|answer)(?:\s*\d+)?\s*[:ï¼š]/im.test(text);
  if (labeled) {
    let current = null;
    for (const line of text.split(/\r?\n/)) {
      const question = line.match(/^\s*(?:q|question)(?:\s*\d+)?\s*[:ï¼š]\s*(.*)$/i);
      const answer = line.match(/^\s*(?:a|answer)(?:\s*\d+)?\s*[:ï¼š]\s*(.*)$/i);
      if (question) { if (current) rows.push(current); current = { question: question[1].trim(), answer: "" }; }
      else if (answer && current) current.answer = answer[1].trim();
      else if (current && line.trim()) current.answer += `${current.answer ? "\n" : ""}${line.trim()}`;
    }
    if (current) rows.push(current);
  } else {
    const firstLine = text.split(/\r?\n/, 1)[0];
    const delimiter = ["\t", ",", ";"].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
    const matrix = []; let row = []; let cell = ""; let quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (char === '"') {
        if (quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
        else quoted = !quoted;
      } else if (!quoted && char === delimiter) { row.push(cell.trim()); cell = ""; }
      else if (!quoted && (char === "\n" || char === "\r")) {
        if (char === "\r" && text[i + 1] === "\n") i += 1;
        row.push(cell.trim()); if (row.some(Boolean)) matrix.push(row); row = []; cell = "";
      } else cell += char;
    }
    row.push(cell.trim()); if (row.some(Boolean)) matrix.push(row);
    if (quoted) throw new Error("A CSV quote is missing its closing quote.");
    if (matrix.length && /^(question|questions|q)$/i.test(matrix[0][0]) && /^(answer|answers|a)$/i.test(matrix[0][1])) matrix.shift();
    rows = matrix.map(([question, answer]) => ({ question: question || "", answer: answer || "" }));
  }
  rows = rows.filter((item) => item.question.trim() || item.answer.trim());
  if (!rows.length) throw new Error("No question and answer pairs were found. Use a Question,Answer CSV or Q:/A: text format.");
  if (rows.length > 500) throw new Error("Import up to 500 FAQs at a time.");
  const invalid = rows.findIndex(({ question, answer }) => question.trim().length < 5 || question.trim().length > 240 || answer.trim().length < 2 || answer.trim().length > 4000);
  if (invalid !== -1) throw new Error(`FAQ ${invalid + 1} needs a question (5â€“240 characters) and answer (2â€“4,000 characters).`);
  return rows.map(({ question, answer }) => ({ question: question.trim(), answer: answer.trim() }));
}

async function api(path, options = {}) {
  const response = await fetch(`/api/admin${path}`, {
    credentials: "include",
    ...options,
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The request could not be completed.");
  return data;
}

function Logo({ suffix = "Admin" }) {
  return <div className="logo"><img className="brand-image" src="/images/techalfa-logo.png" alt="TechAlfa â€” Technology & Innovation" /><span className="g">{suffix}</span></div>;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try { await onLogin(email, password); window.location.assign("/admin"); }
    catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  return <div className="admin-login"><div className="admin-login-card card">
    <Logo /><span className="tag">Secure admin access</span><h1>Welcome back</h1><p>Sign in to manage TechAlfa India.</p>
    <form onSubmit={submit}>
      <label htmlFor="admin-email">Email</label><input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="admin-password">Password</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="admin-error" role="alert">{error}</p>}
      <button className="btn p" type="submit" disabled={busy}>{busy ? "Signing inâ€¦" : "Sign in"}</button>
    </form><a className="admin-back" href="/">â† Back to TechAlfa India</a>
  </div></div>;
}

function Status({ value }) {
  const cls = ["Open", "Live", "Approved", "Completed"].includes(value) ? "g" : ["Pending", "Draft"].includes(value) ? "w" : ["Closed", "Rejected"].includes(value) ? "b" : "";
  return <span className={`st ${cls}`}>{value}</span>;
}

function TableView({ title, rows, columns, onAdd, onEdit, onDelete, onStatus, search, setSearch, addLabel, reviewModeration = false }) {
  const visible = useMemo(() => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())), [rows, search]);
  return <>
    <div className="head"><div><h1>{title}</h1><p>{rows.length} total</p></div>{onAdd && <button className="btn p" onClick={onAdd}>{addLabel}</button>}</div>
    <div className="bar"><input type="search" placeholder={`Search ${title.toLowerCase()}â€¦`} value={search} onChange={(e) => setSearch(e.target.value)} aria-label={`Search ${title}`} /></div>
    <div className="tw"><table><thead><tr>{columns.map(([key, label]) => <th key={key}>{label}</th>)}<th>Actions</th></tr></thead>
      <tbody>{visible.map((row) => <tr key={row._id}>{columns.map(([key]) => <td key={key}>{key === "thumbnailUrl" || key === "imageUrl" ? row[key] ? <a href={row[key]} target="_blank" rel="noopener noreferrer"><img className="admin-thumbnail" src={row[key]} alt={`${row.name || row.title} photo`} /></a> : <span className="admin-no-thumbnail">No photo</span> : key === "status" ? <Status value={row[key] || "Pending"} /> : key === "rating" ? <span className="admin-review-rating" aria-label={`${row[key]} out of 5 stars`}>{"â˜…".repeat(row[key])}{"â˜†".repeat(5 - row[key])}</span> : key === "review" ? <span className="admin-review-text">{row[key]}</span> : key === "date" || key === "deadline" ? row[key] : row[key]}</td>)}<td><div className="act">
        {onStatus && row.status === "Pending" && <><button className="btn s" onClick={() => onStatus(row, "Approved")}>Approve</button><button className="btn s" onClick={() => onStatus(row, "Rejected")}>Reject</button></>}
        {reviewModeration && row.status === "Rejected" && <button className="btn s" onClick={() => onStatus(row, "Approved")}>Approve</button>}{reviewModeration && row.status === "Approved" && <button className="btn s" onClick={() => onStatus(row, "Rejected")}>Unpublish</button>}
        {onEdit && <button className="btn s" onClick={() => onEdit(row)}>Edit</button>}{onDelete && <button className="btn s d" onClick={() => onDelete(row)}>Delete</button>}
      </div></td></tr>)}{visible.length === 0 && <tr><td colSpan={columns.length + 1}>No records found.</td></tr>}</tbody>
    </table></div>
  </>;
}

function RecordDialog({ config, record, onClose, onSave }) {
  const [values, setValues] = useState(() => Object.fromEntries(config.fields.map(([key, , type, choices]) => [key, key === "pageContent" ? legacyPageContent(record?.pageContent || record?.body) : type === "checkbox" ? Boolean(record?.[key]) : record?.[key] ?? (type === "select" ? choices[0] : "")])));
  const [thumbnail, setThumbnail] = useState(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!thumbnail) { setPreviewUrl(""); return undefined; }
    const url = URL.createObjectURL(thumbnail); setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnail]);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try { await onSave(values, { thumbnail, removeThumbnail }); onClose(); } catch (reason) { setError(reason.message); } finally { setBusy(false); }
  }
  return <div className="admin-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><form className="admin-modal card" onSubmit={submit}>
    <h2>{record ? "Edit" : "Add"} {config.label}</h2>
    {config.fields.map(([key, label, type, choices]) => <div key={key}>{type === "content" ? <><label>{label}</label><ContentEditor value={values[key]} onChange={(pageContent) => setValues((current) => ({ ...current, [key]: pageContent }))} onUpload={async (file) => { if (!file.type.match(/^image\/(png|jpeg|webp)$/) || file.size > 4 * 1024 * 1024) throw new Error("Choose a PNG, JPEG, or WebP image up to 4 MB."); const result = await api("/media", { method: "POST", headers: { "Content-Type": file.type }, body: file }); return result.url; }} /></> : type === "checkbox" ? <><label className="admin-inline-checkbox"><input type="checkbox" checked={values[key]} onChange={(e) => setValues({ ...values, [key]: e.target.checked })} />{label}</label><small className="admin-help">Uses this eventâ€™s thumbnail, date, and optional start time. Appears at the top of this event?s public page.</small></> : <><label htmlFor={`record-${key}`}>{label}</label>{type === "select" ? <select id={`record-${key}`} value={values[key]} onChange={(e) => setValues({ ...values, [key]: e.target.value })}>{choices.map((choice) => <option key={choice} value={choice}>{choice === "feature" ? "Feature" : choice === "editorial" ? "Editorial" : choice === "showcase" ? "Showcase" : choice}</option>)}</select> : type === "textarea" || type === "optional-textarea" ? <><textarea id={`record-${key}`} required={type === "textarea"} maxLength={type === "optional-textarea" ? 1000 : undefined} rows={type === "optional-textarea" ? 4 : 6} value={values[key]} onChange={(e) => setValues({ ...values, [key]: e.target.value })} />{type === "optional-textarea" && <small className="admin-help">Shown in the At a glance panel on the public event page. Up to 1,000 characters.</small>}</> : <><input id={`record-${key}`} type={type === "optional-url" ? "url" : type === "optional-time" ? "time" : type} required={!type.startsWith("optional-")} value={values[key]} onChange={(e) => setValues({ ...values, [key]: e.target.value })} />{type === "optional-time" && <small className="admin-help">Countdown runs in India time and defaults to 9:00 AM.</small>}</>}</>}</div>)}
    <div><label htmlFor="record-thumbnail">Thumbnail image</label><input id="record-thumbnail" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { setThumbnail(event.target.files?.[0] || null); setRemoveThumbnail(false); }} /><small className="admin-help">PNG, JPEG, or WebP; up to 4 MB.</small>{(previewUrl || (record?.thumbnailUrl && !removeThumbnail)) && <div className="admin-thumbnail-preview"><img src={previewUrl || record.thumbnailUrl} alt="Thumbnail preview" />{record?.thumbnailUrl && !thumbnail && <label className="admin-remove-thumbnail"><input type="checkbox" checked={removeThumbnail} onChange={(event) => { setRemoveThumbnail(event.target.checked); if (event.target.checked) setThumbnail(null); }} /> Remove current thumbnail</label>}</div>}</div>
    {error && <p className="admin-error" role="alert">{error}</p>}<div className="ctas"><button className="btn p" disabled={busy}>{busy ? "Savingâ€¦" : "Save"}</button><button className="btn" type="button" onClick={onClose}>Cancel</button></div>
  </form></div>;
}

function GalleryDialog({ events, onClose, onSave }) {
  const [eventId, setEventId] = useState("");
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  useEffect(() => {
    if (!file) { setPreviewUrl(""); return undefined; }
    const url = URL.createObjectURL(file); setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  async function submit(event) {
    event.preventDefault(); setError("");
    if (!eventId) { setError("Choose the event this media belongs to."); return; }
    if (!file) { setError("Choose an image or video to upload."); return; }
    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    const isVideo = ["video/mp4", "video/webm"].includes(file.type);
    if (!isImage && !isVideo) { setError("Use a PNG, JPEG, WebP, MP4, or WebM file."); return; }
    if (file.size > 12 * 1024 * 1024 || (isImage && file.size > 4 * 1024 * 1024)) { setError(isImage ? "Images must be 4 MB or smaller." : "Videos must be 12 MB or smaller."); return; }
    setBusy(true);
    try { await onSave({ eventId, caption, mediaType: isVideo ? "video" : "image" }, file); onClose(); }
    catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  return <div className="admin-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><form className="admin-modal card gallery-upload-modal" onSubmit={submit}>
    <h2>Upload event media</h2><p>Choose the event first. Its gallery will show this photo or video alongside that eventâ€™s details.</p>
    {events.length ? <><div><label htmlFor="gallery-event">Event</label><select id="gallery-event" required value={eventId} onChange={(e) => setEventId(e.target.value)}><option value="">Select an event</option>{events.map((item) => <option key={item._id} value={item._id}>{item.title} Â· {item.date || "Date to be announced"}</option>)}</select></div>
      <div><label htmlFor="gallery-file">Photo or video</label><input id="gallery-file" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(e) => setFile(e.target.files?.[0] || null)} /><small className="admin-help">PNG, JPEG, or WebP up to 4 MB; MP4 or WebM up to 12 MB.</small></div>
      {previewUrl && (file?.type.startsWith("video/") ? <video className="gallery-upload-preview" controls preload="metadata" src={previewUrl} /> : <img className="gallery-upload-preview" src={previewUrl} alt="Selected event media preview" />)}
      <div><label htmlFor="gallery-caption">Caption <span className="admin-help-inline">(optional)</span></label><input id="gallery-caption" type="text" maxLength={180} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a short description" /></div>
    </> : <div className="empty-state"><h3>Add an event first</h3><p>Gallery uploads are organized under an event. Create an event from the Events section, then come back to add its media.</p></div>}
    {error && <p className="admin-error" role="alert">{error}</p>}<div className="ctas"><button className="btn p" disabled={busy || !events.length}>{busy ? "Uploadingâ€¦" : "Upload to event"}</button><button className="btn" type="button" onClick={onClose}>Cancel</button></div>
  </form></div>;
}

function GalleryManager({ items, onAdd, onDelete }) {
  return <>
    <div className="head"><div><h1>Event Gallery</h1><p>{items.length} uploaded {items.length === 1 ? "item" : "items"}</p></div><button className="btn p" onClick={onAdd}>+ Upload media</button></div>
    <p className="gallery-admin-intro">Upload photos and short videos into the matching event album. Published event media appears in the public Gallery under that event.</p>
    {items.length ? <div className="gallery-admin-grid">{items.map((item) => <article className="card gallery-admin-card" key={item._id}>
      {item.mediaType === "video" ? <video controls preload="metadata" src={item.url} aria-label={item.caption || item.eventId?.title || "Event video"} /> : <img src={item.url} alt={item.caption || item.eventId?.title || "Event photo"} />}
      <div className="gallery-admin-card-copy"><span className="tag">{item.eventId?.title || "Event"}</span><small>{item.mediaType === "video" ? "Video" : "Photo"}</small><p>{item.caption || "No caption"}</p><button className="btn s d" onClick={() => onDelete(item)}>Remove</button></div>
    </article>)}</div> : <div className="empty-state"><h2>No event media uploaded yet</h2><p>Start an album by uploading a photo or video and selecting its event.</p><button className="btn p" onClick={onAdd}>Upload event media</button></div>}
  </>;
}

function FaqDialog({ section, listings, faq, onClose, onSave }) {
  const [entityId, setEntityId] = useState(faq?.entityId || faq?.eventId || "");
  const [question, setQuestion] = useState(faq?.question || "");
  const [answer, setAnswer] = useState(faq?.answer || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try { await onSave({ section, entityId, question, answer }, faq); onClose(); }
    catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  return <div className="admin-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><form className="admin-modal card faq-modal" onSubmit={submit}>
    <h2>{faq ? "Edit FAQ" : "Add FAQ"}</h2>
    {listings.length ? <>
      <div><label htmlFor="faq-listing">Related {faqSectionLabels[section].singular}</label><select id="faq-listing" required value={entityId} onChange={(e) => setEntityId(e.target.value)}><option value="">Select a {faqSectionLabels[section].singular}</option>{listings.map((item) => <option key={item._id} value={item._id}>{item.title}{item.date ? ` Â· ${item.date}` : ""}</option>)}</select></div>
      <div><label htmlFor="faq-question">Question</label><input id="faq-question" required minLength={5} maxLength={240} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What should attendees know?" /></div>
      <div><label htmlFor="faq-answer">Answer</label><textarea id="faq-answer" required minLength={2} maxLength={4000} rows={7} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write the answer visitors will see." /></div>
      <small className="admin-help">Questions can be 5â€“240 characters; answers up to 4,000 characters.</small>
    </> : <div className="empty-state"><h3>Add a {faqSectionLabels[section].singular} first</h3><p>FAQs appear on a listingâ€™s public detail page. Create a {faqSectionLabels[section].singular}, then add its FAQs here.</p></div>}
    {error && <p className="admin-error" role="alert">{error}</p>}<div className="ctas"><button className="btn p" disabled={busy || !listings.length}>{busy ? "Savingâ€¦" : "Save FAQ"}</button><button className="btn" type="button" onClick={onClose}>Cancel</button></div>
  </form></div>;
}

const faqSectionLabels = { events: { singular: "event", plural: "Events" }, opportunities: { singular: "opportunity", plural: "Opportunities" }, resources: { singular: "resource", plural: "Resources" } };

function FaqManager({ section, items, onAdd, onImport, onEdit, onDelete }) {
  const labels = faqSectionLabels[section];
  return <>
    <div className="head"><div><h1>{labels.plural} FAQs</h1><p>{items.length} {items.length === 1 ? "FAQ" : "FAQs"} across your {labels.plural.toLowerCase()}</p></div><div className="act"><button className="btn" onClick={onImport}>Import FAQs</button><button className="btn p" onClick={onAdd}>+ Add FAQ</button></div></div>
    <p className="faq-admin-intro">Add clear answers to common questions. Each FAQ appears publicly on the detail page for its selected {labels.singular}.</p>
    {items.length ? <div className="faq-admin-list">{items.map((faq) => <article className="card faq-admin-card" key={faq._id}>
      <div className="faq-admin-meta"><span className="tag">{faq.entity?.title || `${labels.singular} removed`}</span><span>{faq.entity?.date || ""}</span></div>
      <h2>{faq.question}</h2><p>{faq.answer}</p><div className="act"><button className="btn s" onClick={() => onEdit(faq)}>Edit</button><button className="btn s d" onClick={() => onDelete(faq)}>Delete</button></div>
    </article>)}</div> : <div className="empty-state"><h2>No FAQs yet</h2><p>Add answers to common questions and they will appear on the matching {labels.singular} page.</p><button className="btn p" onClick={onAdd}>Add {labels.singular} FAQ</button></div>}
  </>;
}

function ListingAdminSection({ section, view, setView, items, faqs, gallery, search, setSearch, recordConfig, setDialog, deleteRecord, onAddFaq, onImportFaq, onEditFaq, onDeleteFaq, onAddGallery, onDeleteGallery }) {
  const labels = faqSectionLabels[section];
  return <>
    <div className="event-admin-tabs" role="tablist" aria-label={`${labels.plural} management`}><button role="tab" aria-selected={view === "listings"} className={view === "listings" ? "on" : ""} onClick={() => setView("listings")}>{labels.plural}</button><button role="tab" aria-selected={view === "faqs"} className={view === "faqs" ? "on" : ""} onClick={() => setView("faqs")}>FAQs <span>{faqs.length}</span></button>{section === "events" && <button role="tab" aria-selected={view === "gallery"} className={view === "gallery" ? "on" : ""} onClick={() => setView("gallery")}>Gallery <span>{gallery.length}</span></button>}</div>
    {view === "listings" ? <TableView title={labels.plural} rows={items} columns={section === "events" ? [["thumbnailUrl", "Thumbnail"], ["title", "Title"], ["date", "Date"], ["type", "Type"], ["place", "Location"], ["status", "Status"]] : section === "opportunities" ? [["thumbnailUrl", "Thumbnail"], ["title", "Title"], ["cat", "Category"], ["org", "Organization"], ["deadline", "Deadline"], ["status", "Status"]] : [["thumbnailUrl", "Thumbnail"], ["title", "Title"], ["category", "Category"], ["summary", "Summary"], ["status", "Status"]]} search={search} setSearch={setSearch} addLabel={`+ Add ${labels.singular[0].toUpperCase()}${labels.singular.slice(1)}`} onAdd={() => setDialog({ config: recordConfig, record: null })} onEdit={(record) => setDialog({ config: recordConfig, record })} onDelete={(record) => deleteRecord(section, record)} /> : view === "faqs" ? <FaqManager section={section} items={faqs} onAdd={onAddFaq} onImport={onImportFaq} onEdit={onEditFaq} onDelete={onDeleteFaq} /> : section === "events" ? <GalleryManager items={gallery} onAdd={onAddGallery} onDelete={onDeleteGallery} /> : null}
  </>;
}

function FaqImportDialog({ section, listings, onClose, onImport }) {
  const [entityId, setEntityId] = useState("");
  const labels = faqSectionLabels[section];
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  let parsed = []; let parseError = "";
  try { if (source.trim()) parsed = parseFaqImport(source); } catch (reason) { parseError = reason.message; }
  async function submit(e) {
    e.preventDefault(); setError("");
    if (!entityId) { setError(`Choose the ${labels.singular} these FAQs belong to.`); return; }
    try { parsed = parseFaqImport(source); } catch (reason) { setError(reason.message); return; }
    setBusy(true);
    try { await onImport({ section, entityId, faqs: parsed }); onClose(); }
    catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  async function readFile(file) {
    if (!file) return;
    if (file.size > 1_000_000) { setError("Choose a CSV file smaller than 1 MB."); return; }
    setError(""); setSource(await file.text());
  }
  return <div className="admin-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><form className="admin-modal card faq-modal faq-import-modal" onSubmit={submit}>
    <h2>Import {labels.singular} FAQs</h2><p>Choose the {labels.singular}, then upload a CSV or paste FAQ text. The importer previews the pairs before saving.</p>
    {listings.length ? <>
      <div><label htmlFor="faq-import-listing">Related {labels.singular}</label><select id="faq-import-listing" required value={entityId} onChange={(e) => setEntityId(e.target.value)}><option value="">Select a {labels.singular}</option>{listings.map((item) => <option key={item._id} value={item._id}>{item.title}{item.date ? ` Â· ${item.date}` : ""}</option>)}</select></div>
      <div><label htmlFor="faq-import-file">CSV file <span className="admin-help-inline">(optional)</span></label><input id="faq-import-file" type="file" accept=".csv,text/csv,text/plain" onChange={(e) => readFile(e.target.files?.[0])} /></div>
      <div><label htmlFor="faq-import-text">Paste CSV or Q&amp;A text</label><textarea id="faq-import-text" rows={10} value={source} onChange={(e) => { setSource(e.target.value); setError(""); }} placeholder={'Question,Answer\n"Where is the event?","At the main auditorium."\n\nOr:\nQ: Where is the event?\nA: At the main auditorium.'} /></div>
      <small className="admin-help">CSV columns: Question, Answer. Text format: Q: â€¦ followed by A: â€¦; one question and answer per pair.</small>
      {parseError ? <p className="admin-error" role="status">{parseError}</p> : parsed.length > 0 && <div className="faq-import-preview"><b>{parsed.length} FAQ{parsed.length === 1 ? "" : "s"} ready to import</b>{parsed.slice(0, 3).map((faq, index) => <p key={index}><strong>{faq.question}</strong><br />{faq.answer}</p>)}{parsed.length > 3 && <small>And {parsed.length - 3} moreâ€¦</small>}</div>}
    </> : <div className="empty-state"><h3>Add a {labels.singular} first</h3><p>Create a {labels.singular} before importing its FAQs.</p></div>}
    {error && <p className="admin-error" role="alert">{error}</p>}<div className="ctas"><button className="btn p" disabled={busy || !listings.length || !parsed.length}>{busy ? "Importingâ€¦" : `Import ${parsed.length || "FAQs"}`}</button><button className="btn" type="button" onClick={onClose}>Cancel</button></div>
  </form></div>;
}

export default function AdminPortal() {
  const loginPage = window.location.pathname.replace(/\/$/, "") === "/admin/login";
  const [session, setSession] = useState(undefined);
  const [section, setSection] = useState("dashboard");
  const [listingViews, setListingViews] = useState({ events: "listings", opportunities: "listings", resources: "listings" });
  const [data, setData] = useState({ dashboard: null, events: [], gallery: [], faqs: [], reviews: [], registrations: [], opportunities: [], resources: [], messages: [], siteContent: emptySite });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(null); const [selectedMessage, setSelectedMessage] = useState(null); const [mobileOpen, setMobileOpen] = useState(false);

  const reload = useCallback(async () => {
    setBusy(true); setError("");
    try {
      const [dashboard, events, gallery, faqs, reviews, registrations, opportunities, resources, messages, siteContent] = await Promise.all([
        api("/dashboard"), api("/events"), api("/gallery"), api("/faqs"), api("/reviews"), api("/registrations"), api("/opportunities"), api("/resources"), api("/messages"), api("/site-content"),
      ]);
      setData({ dashboard, events, gallery, faqs, reviews, registrations, opportunities, resources, messages, siteContent });
    } catch (reason) { if (reason.message.includes("sign in")) setSession(null); setError(reason.message); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api("/session").then(async (value) => {
      if (cancelled) return;
      setSession(value);
      if (!loginPage) await reload();
    }).catch(() => { if (!cancelled) setSession(null); });
    return () => { cancelled = true; };
  }, [loginPage, reload]);

  async function login(email, password) { await api("/login", { method: "POST", body: JSON.stringify({ email, password }) }); }
  async function logout() { await api("/logout", { method: "POST" }); window.location.assign("/admin/login"); }
  async function saveRecord(kind, record, values, imageChange = {}) {
    const payload = { ...values };
    let uploadedUrl = "";
    if (imageChange.thumbnail) {
      if (!["image/png", "image/jpeg", "image/webp"].includes(imageChange.thumbnail.type)) throw new Error("Choose a PNG, JPEG, or WebP image.");
      if (imageChange.thumbnail.size > 4 * 1024 * 1024) throw new Error("Choose an image smaller than 4 MB.");
      const uploaded = await api("/media", { method: "POST", headers: { "Content-Type": imageChange.thumbnail.type }, body: imageChange.thumbnail });
      uploadedUrl = uploaded.url;
      payload.thumbnailUrl = uploadedUrl;
    } else if (imageChange.removeThumbnail) payload.thumbnailUrl = "";
    const path = `/${kind}${record ? `/${record._id}` : ""}`;
    try { await api(path, { method: record ? "PUT" : "POST", body: JSON.stringify(payload) }); }
    catch (reason) { if (uploadedUrl) await api(`/media/${uploadedUrl.split("/").pop()}`, { method: "DELETE" }).catch(() => {}); throw reason; }
    await reload();
  }
  async function saveGalleryItem(values, file) {
    const uploaded = await api("/media", { method: "POST", headers: { "Content-Type": file.type }, body: file });
    try { await api("/gallery", { method: "POST", body: JSON.stringify({ ...values, url: uploaded.url }) }); }
    catch (reason) { await api(`/media/${uploaded.url.split("/").pop()}`, { method: "DELETE" }).catch(() => {}); throw reason; }
    await reload();
  }
  async function saveFaq(values, faq) { await api(`/faqs${faq ? `/${faq._id}` : ""}`, { method: faq ? "PUT" : "POST", body: JSON.stringify(values) }); await reload(); }
  async function importFaqs(values) { await api("/faqs/import", { method: "POST", body: JSON.stringify(values) }); setListingViews((current) => ({ ...current, [values.section]: "faqs" })); await reload(); }
  async function deleteFaq(faq) { if (!window.confirm(`Delete FAQ â€œ${faq.question}â€?`)) return; await api(`/faqs/${faq._id}`, { method: "DELETE" }); await reload(); }
  async function deleteGalleryItem(item) {
    const name = item.caption || `${item.mediaType} for ${item.eventId?.title || "this event"}`;
    if (!window.confirm(`Remove â€œ${name}â€ from the gallery?`)) return;
    await api(`/gallery/${item._id}`, { method: "DELETE" }); await reload();
  }
  async function setReviewStatus(row, status) { await api(`/reviews/${row._id}`, { method: "PATCH", body: JSON.stringify({ status }) }); await reload(); }
  async function deleteReview(row) { if (!window.confirm(`Delete the review from ${row.name}?`)) return; await api(`/reviews/${row._id}`, { method: "DELETE" }); await reload(); }
  async function deleteRecord(kind, record) { if (!window.confirm(`Delete â€œ${record.title}â€?`)) return; await api(`/${kind}/${record._id}`, { method: "DELETE" }); await reload(); }
  async function setRegistrationStatus(row, status) { await api(`/registrations/${row._id}`, { method: "PATCH", body: JSON.stringify({ status }) }); await reload(); }
  async function updateMessage(row, patch) { await api(`/messages/${row.source}/${row._id}`, { method: patch.delete ? "DELETE" : "PATCH", ...(patch.delete ? {} : { body: JSON.stringify({ read: patch.read }) }) }); await reload(); if (patch.delete) setSelectedMessage(null); }
  async function saveSiteContent(event) { event.preventDefault(); const form = new FormData(event.currentTarget); const values = Object.fromEntries(Object.keys(emptySite).map((key) => [key, String(form.get(key) || "")])); await api("/site-content", { method: "PUT", body: JSON.stringify({ values }) }); await reload(); }

  if (loginPage) return <Login onLogin={login} />;
  if (session === undefined) return <div className="admin-loading">Loading admin sessionâ€¦</div>;
  if (!session) return <div className="admin-login"><div className="admin-login-card card"><Logo /><h1>Sign in required</h1><p>Your admin session is missing or expired.</p><a className="btn p" href="/admin/login">Go to login</a><a className="admin-back" href="/">Back to site</a></div></div>;

  const current = sections.find(([key]) => key === section);
  const changeSection = (key) => { setSection(key); setSearch(""); setMobileOpen(false); setSelectedMessage(null); if (["events", "opportunities", "resources"].includes(key)) setListingViews((current) => ({ ...current, [key]: "listings" })); };
  const recordConfig = section === "events" ? { label: "Event", fields: eventFields, kind: "events" } : section === "resources" ? { label: "Resource", fields: resourceFields, kind: "resources" } : { label: "Opportunity", fields: opportunityFields, kind: "opportunities" };

  return <div className="app admin-portal">
    <aside className={`side${mobileOpen ? " open" : ""}`}><Logo /><a className="admin-site-link" href="/">? Back to website</a><nav aria-label="Admin navigation">{sections.map(([key, label, Icon]) => <a href={`#${key}`} key={key} className={key === section ? "on" : ""} aria-current={key === section ? "page" : undefined} onClick={(e) => { e.preventDefault(); changeSection(key); }}><Icon className="i" />{label}{key === "messages" && data.dashboard?.unreadMessages > 0 && <em>{data.dashboard.unreadMessages}</em>}</a>)}</nav>
      <div className="note">Connected to the TechAlfa backend. Changes are saved in the database.</div></aside>
    <div className="admin-content"><div className="top"><button className="btn s" onClick={() => setMobileOpen((v) => !v)} aria-expanded={mobileOpen}><Menu size={16} /> Menu</button><b>TechAlfa Admin</b><button className="btn s admin-top-logout" onClick={logout}><LogOut size={15} /> Sign out</button></div>
      <main>
        {error && <div className="admin-error-banner" role="alert">{error}<button className="btn s" onClick={reload}>Retry</button></div>}
        {busy && <div className="admin-busy" role="status">Updatingâ€¦</div>}
        {section === "dashboard" && <>
          <div className="head"><div><h1>Dashboard</h1><p>What needs your attention today.</p></div><button className="btn p" onClick={() => { setSection("events"); setDialog({ config: { label: "Event", fields: eventFields, kind: "events" }, record: null }); }}>+ New Event</button></div>
          <div className="kpis">{[["Registrations", data.dashboard?.registrations ?? "â€”"], ["Pending approvals", data.dashboard?.pending ?? "â€”"], ["Open events", data.dashboard?.openEvents ?? "â€”"], ["Unread messages", data.dashboard?.unreadMessages ?? "â€”"]].map(([label, value]) => <div className="card kpi" key={label}><b className="g">{value}</b><span>{label}</span></div>)}</div>
          <div className="card"><h2>Recent registrations</h2>{data.registrations.slice(0, 5).map((row) => <p className="admin-row" key={row._id}><span><b>{row.name}</b><br />{row.event || row.interests || row.college}</span><Status value={row.status || "Pending"} /><button className="btn s" onClick={() => changeSection("registrations")}>Review</button></p>)}{!data.registrations.length && <p>No registrations have been received yet.</p>}</div>
        </>}
        {["events", "opportunities", "resources"].includes(section) && <ListingAdminSection section={section} view={listingViews[section]} setView={(view) => setListingViews((current) => ({ ...current, [section]: view }))} items={data[section]} faqs={data.faqs.filter((faq) => (faq.section || "events") === section)} gallery={data.gallery} search={search} setSearch={setSearch} recordConfig={recordConfig} setDialog={setDialog} deleteRecord={deleteRecord} onAddFaq={() => setDialog({ type: "faq", section, faq: null })} onImportFaq={() => setDialog({ type: "faq-import", section })} onEditFaq={(faq) => setDialog({ type: "faq", section, faq })} onDeleteFaq={deleteFaq} onAddGallery={() => setDialog({ type: "gallery" })} onDeleteGallery={deleteGalleryItem} />}
        {section === "registrations" && <TableView title="Registrations" rows={data.registrations} columns={[["name", "Name"], ["email", "Email"], ["college", "College"], ["interests", "Interest"], ["status", "Status"]]} search={search} setSearch={setSearch} onStatus={setRegistrationStatus} />}
        {section === "reviews" && <><div className="head"><div><h1>Student Reviews</h1><p>{data.reviews.filter((review) => review.status === "Pending").length} waiting for approval Â· {data.reviews.length} total</p></div></div><p className="admin-review-note">Approve a review to publish it on the homepage. Rejected reviews stay private and can be approved later.</p><TableView title="Reviews" rows={data.reviews} columns={[["name", "Student"], ["college", "College"], ["rating", "Rating"], ["review", "Review"], ["imageUrl", "Photo"], ["status", "Status"]]} search={search} setSearch={setSearch} onStatus={setReviewStatus} onDelete={deleteReview} reviewModeration /></>}
        {section === "messages" && <>
          <div className="head"><div><h1>Messages</h1><p>{data.dashboard?.unreadMessages || 0} unread</p></div></div>
          <div className="inbox"><div className="ml">{data.messages.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())).map((row) => <button key={`${row.source}-${row._id}`} className={`mi${selectedMessage?._id === row._id ? " on" : ""}${row.read ? "" : " un"}`} onClick={() => { setSelectedMessage(row); if (!row.read) updateMessage(row, { read: true }); }}><b>{row.from}</b><small>{row.type} Â· {new Date(row.createdAt).toLocaleDateString()}</small></button>)}{!data.messages.length && <p>Inbox empty.</p>}</div>
            {selectedMessage && <div className="card"><Status value={selectedMessage.type} /><h2 style={{ marginTop: 10 }}>{selectedMessage.from}</h2><p>{selectedMessage.email} Â· {new Date(selectedMessage.createdAt).toLocaleString()}</p>{(selectedMessage.organization || selectedMessage.phone) && <p className="admin-message-context">{[selectedMessage.organization, selectedMessage.phone].filter(Boolean).join(" / ")}</p>}<p className="admin-message-text">{selectedMessage.text}</p><div className="ctas"><a className="btn p" href={`mailto:${encodeURIComponent(selectedMessage.email)}?subject=${encodeURIComponent(`Re: ${selectedMessage.type}`)}`}>Reply by email</a><button className="btn s d" onClick={() => updateMessage(selectedMessage, { delete: true })}>Delete</button></div></div>}
          </div>
        </>}
        {section === "site-content" && <><div className="head"><div><h1>Site Content</h1><p>Public content settings saved to the database.</p></div></div><form className="card" onSubmit={saveSiteContent}><div className="f2">{[["students", "Students stat"], ["events", "Events stat"], ["colleges", "College connections stat"], ["workshops", "Workshops stat"], ["phone", "Phone"], ["email", "Email"], ["prize", "Prize pool (â‚¹)"]].map(([key, label]) => <div key={key}><label htmlFor={`site-${key}`}>{label}</label><input id={`site-${key}`} name={key} type="text" defaultValue={data.siteContent[key] || ""} required /></div>)}</div><div className="ctas"><button className="btn p">Save changes</button></div></form></>}
        <div className="admin-bottom-actions"><span>{current?.[1]} Â· signed in as {session.email}</span><button className="btn s" onClick={logout}><LogOut size={15} /> Sign out</button></div>
      </main>
    </div>
    {dialog?.type === "gallery" ? <GalleryDialog events={data.events} onClose={() => setDialog(null)} onSave={saveGalleryItem} /> : dialog?.type === "faq-import" ? <FaqImportDialog section={dialog.section} listings={data[dialog.section] || []} onClose={() => setDialog(null)} onImport={importFaqs} /> : dialog?.type === "faq" ? <FaqDialog key={`${dialog.section}-${dialog.faq?._id || "new-faq"}`} section={dialog.section} listings={data[dialog.section] || []} faq={dialog.faq} onClose={() => setDialog(null)} onSave={saveFaq} /> : dialog && <RecordDialog key={`${dialog.config.kind}-${dialog.record?._id || "new"}`} config={dialog.config} record={dialog.record} onClose={() => setDialog(null)} onSave={(values, imageChange) => saveRecord(dialog.config.kind, dialog.record, values, imageChange)} />}
  </div>;
}
