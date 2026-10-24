import { useRef, useState } from "react";

const initialForm = { name: "", email: "", college: "", studyYear: "", interests: "", message: "", consent: false };
const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function createSubmissionId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Join() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const submissionId = useRef(createSubmissionId());

  function update(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });
    setSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/api/community-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Submission-Id": submissionId.current },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Your registration could not be sent. Please try again.");
      setStatus({ type: "success", message: "Your registration was sent successfully. Thank you for your interest." });
      setForm(initialForm);
      submissionId.current = createSubmissionId();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "We could not reach the registration service. Please try again later." });
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="page-main">
    <section className="page-hero wrap"><span className="eyebrow">Join the community</span><h1>Tell us what you want to build.</h1><p className="lead">Share a few details and the TechAlfa team can follow up about ways to participate.</p></section>
    <section className="section wrap form-layout"><form className="join-form" onSubmit={submit}>
      <div className="form-intro"><h2>Community registration</h2><p>All fields marked required must be completed. Your details are sent to the configured TechAlfa HR inbox.</p></div>
      <div className="form-grid">
        <label>Full name <span aria-hidden="true">*</span><input autoComplete="name" name="name" value={form.name} onChange={update} required minLength={2} maxLength={100} /></label>
        <label>Email address <span aria-hidden="true">*</span><input autoComplete="email" type="email" name="email" value={form.email} onChange={update} required maxLength={254} /></label>
        <label>College or university <span aria-hidden="true">*</span><input autoComplete="organization" name="college" value={form.college} onChange={update} required minLength={2} maxLength={160} /></label>
        <label>Current year of study <span aria-hidden="true">*</span><select name="studyYear" value={form.studyYear} onChange={update} required><option value="">Select your year</option><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option><option>Postgraduate</option><option>Other</option></select></label>
        <label className="form-wide">Areas of interest <span aria-hidden="true">*</span><select name="interests" value={form.interests} onChange={update} required><option value="">Select an area</option><option>Events and hackathons</option><option>Workshops and learning</option><option>Campus leadership</option><option>Volunteering and operations</option><option>Projects and open source</option><option>Other</option></select></label>
        <label className="form-wide">Anything else you would like us to know? <span className="optional">Optional</span><textarea name="message" value={form.message} onChange={update} rows="4" maxLength={1200} placeholder="Share your interests or a project you are working on." /></label>
      </div>
      <label className="consent"><input type="checkbox" name="consent" checked={form.consent} onChange={update} required /><span>I agree that TechAlfa may use these details to respond to my registration.</span></label>
      <div className="form-actions"><button className="button button-primary" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send registration"}</button><span className="form-footnote">Please submit once. The button is disabled while your request is processing.</span></div>
      <div className={`form-message ${status.type}`} aria-live="polite" role={status.type === "error" ? "alert" : "status"}>{status.message}</div>
    </form><aside className="form-aside"><span className="eyebrow">What happens next</span><h2>Your details help the organizers follow up.</h2><p>Choose the areas you are interested in so the TechAlfa team can respond with relevant ways to take part.</p><p>Please do not include passwords or other sensitive information in this form.</p></aside></section>
  </main>;
}
