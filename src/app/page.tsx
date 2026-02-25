import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Work from "@/components/Work";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <Cursor />
      <div className="noise" />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Work />
        <Services />
        <About />
        <Contact />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
