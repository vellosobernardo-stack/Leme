import { 
  Header, 
  Hero, 
  ComoFunciona,
  SpotlightChat,
  FreeValue,
  ProFeatures,
  ParaQuem,
  Preco,
  FAQ, 
  CTAFinal, 
  StickyCTA,
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
        <ComoFunciona />
        <SpotlightChat />
        <FreeValue />
        <ProFeatures />
        <ParaQuem />
        <Preco />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}