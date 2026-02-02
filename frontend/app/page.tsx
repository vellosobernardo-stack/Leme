import { 
  Header, 
  Hero, 
  TrustBar,
  // HeroPreAbertura, // Temporariamente removido - foco na proposta central
  ValueDelivery, 
  HowItWorks, 
  Authority, 
  CTAFinal, 
  Footer 
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustBar />
        {/* HeroPreAbertura removido temporariamente - código preservado em components/landing/HeroPreAbertura.tsx */}
        <ValueDelivery />
        <HowItWorks />
        <Authority />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}