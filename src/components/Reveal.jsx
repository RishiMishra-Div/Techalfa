import { useEffect, useRef, useState } from "react";

// Wraps any content and fades/slides it in the first time it scrolls into view.
// Usage: <Reveal><div className="card">...</div></Reveal>
// Optional props: delay (ms), y (px to slide up from, default 24), as (wrapper tag, default "div")
export default function Reveal({ children, delay = 0, duration = 700, y = 24, className = "", as: Tag = "div" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={"reveal" + (shown ? " in" : "") + (className ? " " + className : "")}
      style={{ "--d": delay + "ms", "--y": y + "px", "--dur": duration + "ms" }}
    >
      {children}
    </Tag>
  );
}