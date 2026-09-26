const paths = {
  arrow: `<path d="M5 12h14M13 6l6 6-6 6"/>`,
  chev: `<path d="m9 6 6 6-6 6"/>`,
  check: `<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>`,
  calendar: `<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`,
  code: `<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m10 9-3 3 3 3M14 9l3 3-3 3"/>`,
  cpu: `<rect x="6" y="6" width="12" height="12" rx="3"/><circle cx="12" cy="12" r="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>`,
  rocket: `<path d="M12 2c3.5 2 5.5 5.5 5.5 9.5L15 15H9l-2.5-3.5C6.5 7.500 8.500 4 12 2Z"/><circle cx="12" cy="9.500" r="1.500"/><path d="M9 15l-3 3.500 3.500-.5M15 15l3 3.500-3.500-.5M12 17v4"/>`,
  userplus: `<circle cx="9" cy="8" r="3.500"/><path d="M2 20c0-3.500 3-6 7-6s7 2.500 7 6M19 8v6M16 11h6"/>`,
  users: `<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M17 5a3 3 0 0 1 0 6M21 20c0-2-1.500-3.500-4-4"/>`,
  trophy: `<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0ZM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  mic: `<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>`,
  bookmark: `<path d="M6 3h12v18l-6-4-6 4z"/>`,
  eye: `<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`,
  zap: `<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>`,
  term: `<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 10 3 2-3 2M12 15h5"/>`,
  chat: `<path d="M4 5h16v11H9l-5 4z"/>`,
  phone: `<path d="M6 3h4l2 5-2.500 1.500a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/>`,
  cap: `<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c0 1.500 3 3 6 3s6-1.500 6-3v-5"/>`,
  brief: `<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>`,
};

export default function Icon({ name }) {
  return <svg className="i" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: paths[name] }} />;
}