"use client";

export function VideoSection() {
  return (
    <section className="bg-[#F7FAFD] py-32">
      <div className="px-6 lg:px-20 max-w-6xl mx-auto">
        {/* Placeholder do vídeo */}
        <div className="aspect-video bg-muted/30 border border-border/40 rounded-2xl flex items-center justify-center">
          {/* Quando tiver o vídeo, substitui por um <video> ou <iframe> */}
          <span className="text-muted-foreground text-lg">Vídeo em breve</span>
        </div>

        {/* Nota */}
        <p className="text-sm text-muted-foreground text-center mt-4">
          Vídeo real da plataforma.
        </p>
      </div>
    </section>
  );
}