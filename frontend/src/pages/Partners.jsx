import PageIntro from "../components/PageIntro";
import InquiryForm from "../components/InquiryForm";
import { partners } from "../data";

const fields = [
  { name: "fullName", label: "Full name", required: true, max: 100, autoComplete: "name" },
  { name: "email", label: "Work email", type: "email", required: true, max: 254, autoComplete: "email" },
  { name: "organization", label: "Organization", required: true, max: 160, autoComplete: "organization" },
  { name: "partnershipType", label: "Partnership interest", required: true, options: ["Event sponsorship", "Workshop or speaker", "Campus collaboration", "Hiring and opportunities", "Media partnership", "Other"] },
  { name: "message", label: "Tell us about your idea", required: true, multiline: true, wide: true, max: 2000 },
];

export default function Partners() {
  return <main className="page-main"><PageIntro eyebrow="Partners & collaborators" title="Let’s create more opportunities together." description="We welcome conversations with organizations, colleges and people who want to support student learning and innovation." />
    <section className="section wrap"><div className="section-heading"><div><span className="eyebrow">Our network</span><h2>Organizations listed by TechAlfa</h2></div></div><div className="partner-wall">{partners.map((partner, i) => <div className="partner-wordmark" key={partner}><span>0{i + 1}</span><strong>{partner}</strong></div>)}</div><p className="data-note">Names are shown as supplied; official partner logos and current partnership details were not provided.</p></section>
    <section className="section wrap contact-layout"><div><span className="eyebrow">Work with us</span><h2>Build a student-focused collaboration.</h2><p>Tell us what you have in mind. The team can follow up about events, learning programs, campus connections or other partnership ideas.</p></div><div className="form-panel"><h2>Partnership enquiry</h2><InquiryForm endpoint="/api/partner-inquiries" fields={fields} submitLabel="Send partnership enquiry" successMessage="Your partnership enquiry has been sent. Thank you." consentText="TechAlfa may use these details to respond to this enquiry." /></div></section>
  </main>;
}
