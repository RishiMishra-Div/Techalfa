import PageIntro from "../components/PageIntro";
import InquiryForm from "../components/InquiryForm";

const fields = [
  { name: "fullName", label: "Full name", required: true, max: 100, autoComplete: "name" },
  { name: "email", label: "Email address", type: "email", required: true, max: 254, autoComplete: "email" },
  { name: "phone", label: "Phone number", type: "tel", max: 30, autoComplete: "tel" },
  { name: "organization", label: "College or organization", max: 160, autoComplete: "organization" },
  { name: "enquiryType", label: "Enquiry type", required: true, options: ["General enquiry", "Event participation", "Partnership", "Media", "Volunteering", "Other"] },
  { name: "subject", label: "Subject", required: true, max: 160 },
  { name: "message", label: "Your message", required: true, multiline: true, wide: true, max: 2000 },
];

export default function Contact() {
  return <main className="page-main"><PageIntro eyebrow="Contact TechAlfa" title="Let’s start a conversation." description="Have a question, an idea, or want to work together? Send the team a message." />
    <section className="section wrap contact-layout"><div className="contact-details"><span className="eyebrow">Reach us directly</span><a href="mailto:techalfa2026@gmail.com">techalfa2026@gmail.com</a><a href="tel:+918830079798">+91 88300 79798</a><p>We’ll respond using the contact details you provide.</p></div><div className="form-panel"><h2>Send an enquiry</h2><InquiryForm endpoint="/api/contact-messages" fields={fields} submitLabel="Send message" successMessage="Your message has been sent. Thank you for contacting TechAlfa." consentText="TechAlfa may use these details to respond to this enquiry." /></div></section>
  </main>;
}
