"use client";

export default function Marquee() {
  const items = [
    "Rust",
    "TypeScript",
    "Python",
    "Networking",
    "Servers",
    "Cloudflare",
    "Microcontrollers",
    "React",
  ];

  return (
    <section className="py-12 md:py-16 border-y border-border overflow-hidden">
      <div className="flex">
        <div className="marquee-track">
          {[...items, ...items, ...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-8 shrink-0">
              <span className="text-display text-stroke whitespace-nowrap">
                {item}
              </span>
              <span className="text-accent text-2xl">&times;</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
