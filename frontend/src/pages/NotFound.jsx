import { Link } from "react-router-dom";

export default function NotFound() {
  return <main className="page-main wrap"><section className="empty-state"><span className="eyebrow">404</span><h1>We couldn't find that page.</h1><p>Check the address or return to the TechAlfa home page.</p><Link className="button button-primary" to="/">Go to home</Link></section></main>;
}
