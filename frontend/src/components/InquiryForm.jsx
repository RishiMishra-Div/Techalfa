import { useRef, useState } from "react";

const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function InquiryForm({ endpoint, fields, submitLabel, successMessage, consentText }) {
  const initial = Object.fromEntries(fields.filter((field) => field.name !== "consent").map((field) => [field.name, ""]));
  if (consentText) initial.consent = false;
  const [form, setForm] = useState(initial);
  const [state, setState] = useState({ type: "idle", message: "" });
  const [busy, setBusy] = useState(false);
  const id = useRef(makeId());
  const update = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  async function submit(e) {
    e.preventDefault(); setBusy(true); setState({ type: "idle", message: "" });
    try {
      const response = await fetch(`${apiBase}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json", "X-Submission-Id": id.current }, body: JSON.stringify(form) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not send your message. Please try again.");
      setState({ type: "success", message: successMessage }); setForm(initial); id.current = makeId();
    } catch (error) { setState({ type: "error", message: error.message || "The service could not be reached. Please try again later." }); }
    finally { setBusy(false); }
  }
  return <form className="join-form inquiry-form" onSubmit={submit}><div className="form-grid">{fields.filter((field) => field.name !== "consent").map((field) => <label className={field.wide ? "form-wide" : ""} key={field.name}>{field.label}{field.required && <> <span aria-hidden="true">*</span></>}{field.options ? <select name={field.name} required={field.required} value={form[field.name]} onChange={update}><option value="">Choose an option</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : field.multiline ? <textarea name={field.name} value={form[field.name]} onChange={update} required={field.required} maxLength={field.max || 2000} rows="5" placeholder={field.placeholder || ""} /> : <input name={field.name} type={field.type || "text"} value={form[field.name]} onChange={update} required={field.required} maxLength={field.max || 200} autoComplete={field.autoComplete} />}</label>)}</div>{consentText && <label className="consent"><input type="checkbox" name="consent" checked={form.consent} onChange={update} required /><span>{consentText}</span></label>}<button className="button button-primary" type="submit" disabled={busy}>{busy ? "Sending…" : submitLabel}</button><p className={`form-message ${state.type}`} aria-live="polite" role={state.type === "error" ? "alert" : "status"}>{state.message}</p></form>;
}
