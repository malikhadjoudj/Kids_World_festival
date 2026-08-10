import { useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import HeroSection from '../components/landing/HeroSection';
import EventLocationSection from '../components/landing/EventLocationSection';
import PacksSection from '../components/landing/PacksSection';
import HowItWorks from '../components/landing/HowItWorks';
import EventHighlights from '../components/landing/EventHighlights';
import CTASection from '../components/landing/CTASection';


function LandingPage() {
  // Scroll-triggered fade-in for sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <main className="app__main">
        <HeroSection />
        <div className="fade-in-section">
          <EventLocationSection />
        </div>
        <div className="fade-in-section">
          <PacksSection />
        </div>
        <div className="fade-in-section">
          <HowItWorks />
        </div>
        <div className="fade-in-section">
          <EventHighlights />
        </div>
        <div className="fade-in-section">
          <CTASection />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default LandingPage;
