import { Header, Hero, Problems, Features, HowItWorks, WhyLeme, CTAFinal, Footer } from "@/components/landing";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problems />
        <Features />
        <HowItWorks />
        <WhyLeme />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}