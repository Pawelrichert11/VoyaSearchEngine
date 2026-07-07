import { useEffect, useState } from "react";
import { HERO_IMAGES } from "@/lib/voya-data";

export function RotatingHero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % HERO_IMAGES.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      {HERO_IMAGES.map((src, idx) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          loading={idx === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-in-out ${
            idx === i ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {/* readability veil */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/55 to-background" />
      <div className="absolute inset-0 bg-hero-gradient opacity-40 mix-blend-multiply" />
      {/* thumbnail strip */}
      <div className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 gap-1.5 sm:flex">
        {HERO_IMAGES.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 rounded-full transition-all ${
              idx === i ? "w-8 bg-brand-blue" : "w-1.5 bg-foreground/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}