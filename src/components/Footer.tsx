"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-20 md:py-24 px-6 md:px-12 lg:px-24 border-t border-border">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        {/* Logo & Copyright */}
        <div>
          <Link href="/" className="text-label block mb-2">
            Kyro
          </Link>
          <p className="text-label text-muted">
            &copy; {new Date().getFullYear()}
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-8">
          {["Work", "Skills", "About", "Contact"].map((link) => (
            <Link
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-label text-muted hover:text-fg transition-colors"
              data-cursor-hover
            >
              {link}
            </Link>
          ))}
        </div>

        {/* Back to Top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-label text-muted hover:text-fg transition-colors flex items-center gap-2"
          data-cursor-hover
        >
          Back to Top
          <span className="text-accent">&uarr;</span>
        </button>
      </div>

      {/* Bottom Giant Text */}
      <div className="mt-24 md:mt-32 overflow-hidden">
        <p className="text-[15vw] font-bold leading-none text-border/10 text-center whitespace-nowrap">
          KYRO
        </p>
      </div>
    </footer>
  );
}
