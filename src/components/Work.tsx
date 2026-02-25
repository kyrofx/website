"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    num: "01",
    title: "PowerPlay",
    subtitle: "",
    category: "Apple",
    year: "2023",
    description: "Details under NDA",
    details: "This project was completed during my time at Apple. Details remain under NDA.",
    tech: [],
  },
  {
    num: "02",
    title: "Sequoia",
    subtitle: "Edge",
    category: "Apple",
    year: "2024",
    description: "Fitness device for barbell workout metrics",
    details:
      "A fitness device designed to capture and analyze metrics from barbell-aligned workouts. Built during my time at Apple, involving embedded firmware, sensor integration, and real-time data processing on microcontrollers.",
    tech: ["Embedded C", "Swift", "Microcontrollers", "Sensor Fusion", "BLE"],
  },
  {
    num: "03",
    title: "Aegis",
    subtitle: "",
    category: "Authentication",
    year: "2026",
    description: "Full custom OAuth implementation",
    details:
      "A ground-up OAuth 2.0 provider built for full control over authentication flows. Handles token issuance, refresh rotation, scope management, and session lifecycle without relying on third-party auth services.",
    tech: ["TypeScript", "EJS", "PostgreSQL", "OAuth 2.0"],
  },
  {
    num: "04",
    title: "Eos",
    subtitle: "",
    category: "Infrastructure",
    year: "2026",
    description: "Dashboard for Railway, Dokploy, and Unifi management",
    details:
      "A unified control plane for managing all my infrastructure. Integrates with Railway and Dokploy for deployment management, network gear for monitoring, and aggregates metrics across services into a single dashboard.",
    tech: ["TypeScript", "Next.js", "Railway API", "REST APIs"],
  },
  {
    num: "05",
    title: "Mousa",
    subtitle: "",
    category: "Gallery",
    year: "2026",
    description: "Art gallery leveraging Cloudflare R2",
    details:
      "A minimal, high-performance image gallery for displaying art. Uses Cloudflare R2 for object storage with optimized delivery, lazy loading, and a clean browsing experience built around the work itself.",
    tech: ["TypeScript", "Cloudflare R2", "Workers", "React"],
  },
];

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<(typeof projects)[number] | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".work-item").forEach((item) => {
        gsap.fromTo(
          item,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(
        ".modal-backdrop",
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        ".modal-content",
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", delay: 0.1 }
      );
    } else {
      document.body.style.overflow = "";
    }
  }, [selected]);

  const closeModal = () => setSelected(null);

  return (
    <>
      <section ref={sectionRef} id="work" className="py-32 md:py-48 lg:py-64 px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-20 md:mb-32 border-b border-border pb-12">
          <div>
            <p className="text-label text-muted mb-4">Selected Work</p>
            <h2 className="text-huge">Projects</h2>
          </div>
          <p className="text-label text-muted hidden md:block">
            (2023—2026)
          </p>
        </div>

        {/* Projects Grid */}
        <div className="space-y-px">
          {projects.map((project) => (
            <article
              key={project.num}
              className="work-item group border-b border-border py-12 md:py-16 lg:py-20 cursor-pointer"
              data-cursor-hover
              onClick={() => setSelected(project)}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2 md:col-span-1">
                  <span className="text-label text-muted">{project.num}</span>
                </div>

                <div className="col-span-10 md:col-span-5">
                  <h3 className="text-display leading-none group-hover:text-accent transition-colors duration-300">
                    <span>{project.title}</span>
                    {project.subtitle && (
                      <span className="text-stroke hover-fill ml-2">
                        {project.subtitle}
                      </span>
                    )}
                  </h3>
                </div>

                <div className="col-span-6 md:col-span-2 hidden md:block">
                  <p className="text-label text-muted">{project.category}</p>
                </div>

                <div className="col-span-6 md:col-span-3 hidden md:block">
                  <p className="text-body text-muted">{project.description}</p>
                </div>

                <div className="col-span-12 md:col-span-1 hidden md:block text-right">
                  <p className="text-label">{project.year}</p>
                </div>

                <div className="col-span-12 mt-4 md:hidden">
                  <div className="flex justify-between items-center">
                    <p className="text-label text-muted">{project.category}</p>
                    <span className="text-accent">&rarr;</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <div
          className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-bg/80 backdrop-blur-sm px-6"
          onClick={closeModal}
        >
          <div
            className="modal-content relative w-full max-w-2xl border border-border bg-bg p-10 md:p-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-label text-muted hover:text-fg transition-colors"
              data-cursor-hover
            >
              Close
            </button>

            {/* Header */}
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-label text-muted">{selected.num}</span>
              <span className="text-label text-muted">{selected.year}</span>
              <span className="text-label text-accent">{selected.category}</span>
            </div>

            <h3 className="text-display mb-8">
              {selected.title}
              {selected.subtitle && (
                <span className="text-stroke hover-fill ml-2">{selected.subtitle}</span>
              )}
            </h3>

            {/* Details */}
            <p className="text-body text-muted mb-10">
              {selected.details}
            </p>

            {/* Tech */}
            {selected.tech.length > 0 && (
              <div>
                <p className="text-label text-muted mb-4">Stack</p>
                <div className="flex flex-wrap gap-3">
                  {selected.tech.map((t) => (
                    <span
                      key={t}
                      className="text-label border border-border px-4 py-2 hover:border-accent hover:text-accent transition-colors"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
