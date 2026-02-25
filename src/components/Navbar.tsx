"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function Navbar() {
  const [time, setTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      gsap.fromTo(
        ".menu-item",
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [menuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="flex items-center justify-between px-6 py-4 md:px-12">
          <Link href="/" className="text-label text-fg">
            Kyro
          </Link>

          <div className="hidden md:flex items-center gap-12">
            <span className="text-label text-muted">{time}</span>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-label text-fg hover:text-accent transition-colors"
            data-cursor-hover
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {/* Full Screen Menu */}
      <div
        className={`fixed inset-0 z-40 bg-bg transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="h-full flex flex-col justify-center px-6 md:px-12">
          <div className="space-y-2">
            {[
              { label: "Work", href: "#work", num: "01" },
              { label: "Skills", href: "#skills", num: "02" },
              { label: "About", href: "#about", num: "03" },
              { label: "Contact", href: "#contact", num: "04" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="menu-item group flex items-baseline gap-4 py-2"
                data-cursor-hover
              >
                <span className="text-label text-muted">{item.num}</span>
                <span className="text-huge text-stroke hover-fill transition-all duration-300 group-hover:translate-x-4">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="absolute bottom-12 left-6 md:left-12 right-6 md:right-12 flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-label text-muted">Get in touch</p>
              <a
                href="mailto:hello@kyro.dog"
                className="text-body link-hover"
                data-cursor-hover
              >
                hello@kyro.dog
              </a>
            </div>
            <div className="hidden md:flex gap-8">
              <a
                href="https://github.com/kyrofx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-label text-muted hover:text-fg transition-colors"
                data-cursor-hover
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
