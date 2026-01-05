import { 
  Header, 
  Hero, 
  TrustBar,
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
        <ValueDelivery />
        <HowItWorks />
        <Authority />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}