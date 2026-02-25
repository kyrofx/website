"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const skills = [
  {
    num: "01",
    title: "Backend",
    features: ["Rust", "JavaScript / Node", "Python"],
  },
  {
    num: "02",
    title: "Frontend",
    features: ["React / Next.js", "TypeScript", "HTML / CSS"],
  },
  {
    num: "03",
    title: "Networking",
    features: ["Network Management", "Cloudflare", "Edge Infrastructure"],
  },
  {
    num: "04",
    title: "Systems",
    features: ["Server Administration", "Microcontrollers", "Embedded"],
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".services-title",
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );

      gsap.utils.toArray<HTMLElement>(".service-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: i * 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="py-32 md:py-48 lg:py-64 px-6 md:px-12 lg:px-24 bg-fg text-bg"
    >
      {/* Section Header */}
      <div className="mb-20 md:mb-32 lg:mb-40">
        <p className="text-label text-bg/50 mb-4">What I Know</p>
        <h2 className="services-title text-huge">
          Skills
        </h2>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-bg/10">
        {skills.map((skill) => (
          <div
            key={skill.num}
            className="service-card group bg-fg p-10 md:p-16 lg:p-20 hover:bg-accent transition-colors duration-500"
            data-cursor-hover
          >
            <div className="flex justify-between items-start mb-16 md:mb-20">
              <span className="text-label text-bg/50 group-hover:text-bg/80">
                {skill.num}
              </span>
              <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                &nearr;
              </span>
            </div>

            <h3 className="text-title md:text-display mb-10 md:mb-12 group-hover:translate-x-2 transition-transform">
              {skill.title}
            </h3>

            <ul className="space-y-3">
              {skill.features.map((feature) => (
                <li
                  key={feature}
                  className="text-body text-bg/60 group-hover:text-bg/80 flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-current rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Text */}
      <div className="mt-32 md:mt-40 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
        <p className="text-title max-w-xl">
          Hardware to software.
          <br />
          <span className="text-bg/50">End to end.</span>
        </p>
        <a
          href="#contact"
          className="text-label border-b border-bg pb-1 hover:text-accent hover:border-accent transition-colors"
          data-cursor-hover
        >
          Get in Touch &rarr;
        </a>
      </div>
    </section>
  );
}
