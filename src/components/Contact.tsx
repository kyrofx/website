"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-title span",
        { y: 200 },
        {
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-32 md:py-48 lg:py-64 px-6 md:px-12 lg:px-24 border-t border-border"
    >
      {/* Giant CTA */}
      <div className="mb-24 md:mb-40">
        <h2 className="contact-title text-massive leading-[0.85]">
          <div className="overflow-hidden">
            <span className="inline-block">Let&apos;s</span>
          </div>
          <div className="overflow-hidden">
            <span className="inline-block text-stroke hover-fill">Talk</span>
          </div>
          <p className="text-title font-serif italic text-accent mt-4 md:mt-6">
            &mdash; reach out
          </p>
        </h2>
      </div>

      {/* Contact Info */}
      <div className="max-w-2xl space-y-16">
        <div>
          <p className="text-label text-muted mb-4">Email</p>
          <a
            href="mailto:hello@kyro.dog"
            className="text-title link-hover"
            data-cursor-hover
          >
            hello@kyro.dog
          </a>
        </div>

        <div>
          <p className="text-label text-muted mb-4">GitHub</p>
          <a
            href="https://github.com/kyrofx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-title link-hover"
            data-cursor-hover
          >
            github.com/kyrofx
          </a>
        </div>

        <div className="pt-12 border-t border-border">
          <p className="text-label text-muted mb-4">Currently</p>
          <p className="text-title">
            Studying EE/CE
          </p>
          <p className="text-body text-muted mt-4">
            Open to interesting projects and collaborations.
          </p>
        </div>
      </div>
    </section>
  );
}
