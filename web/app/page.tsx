import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Hero } from '@/components/landing/hero';
import { FeaturesGrid } from '@/components/landing/features';
import { CoursesPreview } from '@/components/landing/courses-preview';
import { Testimonials } from '@/components/landing/testimonials';
import { Pricing } from '@/components/landing/pricing';
import { CTA } from '@/components/landing/cta';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturesGrid />
        <CoursesPreview />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
