export default function Count() {
  return (
  <div className="cd mono">
    {[["08", "DAYS"], ["14", "HOURS"], ["32", "MINS"]].map(([n, l]) => (
      <div key={l}>{n}<small>{l}</small></div>
    ))}
  </div>
  );
}