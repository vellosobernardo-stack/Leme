import { 
  Header, 
  Hero, 
  SocialProof,
  TrustBar,
  FreePro,
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
        <FreePro />
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