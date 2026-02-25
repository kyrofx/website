"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-line",
        { y: 200, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power4.out",
          delay: 0.5,
        }
      );

      gsap.fromTo(
        ".hero-meta",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          delay: 1.2,
        }
      );

      gsap.to(".hero-title", {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="min-h-screen flex flex-col justify-end relative overflow-hidden pb-24 md:pb-32 px-6 md:px-12 lg:px-24"
    >
      {/* Background Number */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <span className="text-[40vw] font-bold text-border/30 leading-none">
          K
        </span>
      </div>

      {/* Main Title */}
      <div ref={titleRef} className="hero-title relative z-10">
        <div className="overflow-hidden">
          <h1 className="hero-line text-massive">
            Kyro
          </h1>
        </div>
        <div className="overflow-hidden">
          <h1 className="hero-line text-massive text-stroke hover-fill">
            Engineer
          </h1>
        </div>
        <div className="overflow-hidden">
          <h1 className="hero-line text-massive">
            Builder<span className="text-[clamp(1.25rem,3.5vw,3rem)] font-serif italic text-accent ml-4 md:ml-8 tracking-normal">— of systems</span>
          </h1>
        </div>
      </div>

      {/* Meta Info */}
      <div className="relative z-10 mt-20 md:mt-32 flex flex-col md:flex-row justify-between gap-12 md:gap-16">
        <div className="hero-meta max-w-md">
          <p className="text-body text-muted">
            Full stack developer, network engineer, and server admin
            studying Electrical and Computer Engineering. I build things
            from silicon to the browser.
          </p>
        </div>

        <div className="hero-meta flex gap-16 md:gap-24">
          <div>
            <p className="text-label text-muted mb-2">Focus</p>
            <p className="text-title">EE/CE</p>
          </div>
          <div>
            <p className="text-label text-muted mb-2">Stack</p>
            <p className="text-title">Full</p>
          </div>
          <div>
            <p className="text-label text-muted mb-2">Status</p>
            <p className="text-title">Open</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <span className="text-label text-muted">Scroll</span>
        <div className="w-px h-16 bg-gradient-to-b from-fg to-transparent" />
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-24 right-6 md:right-12 text-label text-muted">
        <p>Software</p>
        <p>Hardware</p>
        <p>Networks</p>
      </div>
    </section>
  );
}
