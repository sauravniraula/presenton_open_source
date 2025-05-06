import Header from "@/components/homePage/header";
import Footer from "@/components/homePage/Footer";
import Hero from "./(landing-pages)/presentation-generator/components/Hero";
import Intro from "./(landing-pages)/presentation-generator/components/Intro";
import Pricing from "./(landing-pages)/presentation-generator/components/Pricing";
import Testimonial from "./(landing-pages)/presentation-generator/components/Testimonial";
import Usage from "./(landing-pages)/presentation-generator/components/Usage";
import FAQ from "./(landing-pages)/presentation-generator/components/FAQ";
import Blogs from "./(landing-pages)/presentation-generator/components/Blogs";


export default function Home() {
  return (
    <>
      {/* <Header />
      <MainIntro />
      <HeroSection />
      <AnimationInfo
        title="Intelligent Animation in a Click"
        description="Our intelligent AI automatically analyzes your slides and selects which elements to animate. Never worry about manually setting up animations again - let AI handle it for you."
        media={
          <video
            src="/animation-video.mp4"
            width={627}
            height={362}
            className="rounded-lg w-full h-auto object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        }
        imagePosition="right"
      />
      <UploadSection />
      <ApplicationShowcase />
      <AnimationInfo
        title="Intelligent Animation in a Click"
        description="Our intelligent AI automatically analyzes your slides and selects which elements to animate. Never worry about manually setting up animations again - let AI handle it for you."
        media={
          <video
            src="/animation-video.mp4"
            width={627}
            height={362}
            className="rounded-lg w-full h-auto object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        }
        imagePosition="left"
      />
      <PresentationShowcase />
      <TemplateSection />
      <Footer /> */}
      <Header />
      <Intro />
      <Hero />
      <Usage />
      <Testimonial />
      <Pricing />
      <FAQ />
      <Blogs />
      <Footer />
    </>
  );
}
