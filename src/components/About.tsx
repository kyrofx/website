"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".about-big-text", {
        xPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.fromTo(
        ".about-content",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-content",
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="py-32 md:py-48 lg:py-64 overflow-hidden">
      {/* Giant Text */}
      <div className="about-big-text whitespace-nowrap mb-24 md:mb-40">
        <h2 className="text-[20vw] font-bold leading-none text-border/20">
          KYRO KYRO KYRO KYRO
        </h2>
      </div>

      {/* Content */}
      <div className="about-content px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-40">
          {/* Left Column */}
          <div>
            <p className="text-label text-muted mb-12">About Me</p>
            <h3 className="text-display mb-12">
              Good engineering should feel{" "}
              <span className="font-serif italic text-accent">effortless</span>.
            </h3>
            <p className="text-body text-muted mb-10">
              I'm an Electrical and Computer Engineering student.
              From full stack web apps to bare metal server
              infrastructure, I work across the entire technology stack.
            </p>
            <p className="text-body text-muted">
              I've built custom OAuth systems, infrastructure dashboards,
              and art galleries. I manage my own servers, configure edge
              networks, and have worked with microcontrollers at Apple.
            </p>
          </div>

          {/* Right Column - Values */}
          <div className="space-y-20">
            {[
              {
                num: "01",
                title: "Depth",
                description:
                  "I don't just use tools, I work to understand how they work.",
              },
              {
                num: "02",
                title: "Ownership",
                description:
                  "I run my own infrastructure. If something breaks, I can fix it.",
              },
              {
                num: "03",
                title: "Craft",
                description:
                  "Whether it's a REST API or a PCB layout, the details matter.",
              },
            ].map((value) => (
              <div
                key={value.num}
                className="group border-t border-border pt-10"
              >
                <div className="flex items-start gap-8">
                  <span className="text-label text-muted">{value.num}</span>
                  <div>
                    <h4 className="text-title mb-2 group-hover:text-accent transition-colors">
                      {value.title}
                    </h4>
                    <p className="text-body text-muted">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Row - Scrolling */}
        <div className="mt-32 md:mt-40 pt-20 border-t border-border overflow-hidden">
          <div className="flex gap-12 animate-[techscroll_20s_linear_infinite] w-max">
            {[...Array(2)].flatMap((_, dupeIdx) =>
              [
                { value: "Rust", label: "Primary" },
                { value: "TypeScript", label: "Frontend" },
                { value: "Net", label: "Network" },
                { value: "EE/CE", label: "Studying" },
              ].map((stat) => (
                <div key={`${stat.label}-${dupeIdx}`} className="flex items-baseline gap-6 shrink-0 pr-12">
                  <p className="text-huge leading-none">{stat.value}</p>
                  <p className="text-label text-muted">{stat.label}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
