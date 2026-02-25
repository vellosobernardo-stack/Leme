import { 
  Header, 
  Hero, 
  SocialProof,
  TrustBar,
  // HeroPreAbertura, // Temporariamente removido - foco na proposta central
  PainSection,
  ValueDelivery, 
  HowItWorks, 
  Authority, 
  CTAFinal, 
  Footer 
} from "@/components/landing";
import RefCapture from "@/components/landing/RefCapture";

export default function Home() {
  return (
    <>
      <RefCapture />
      <Header />
      <main>
        <Hero />
        <SocialProof /> 
        <TrustBar />
        {/* HeroPreAbertura removido temporariamente - código preservado em components/landing/HeroPreAbertura.tsx */}
        <PainSection />
        <ValueDelivery />
        <HowItWorks />
        <Authority />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}