import React, { useState, useEffect, useRef } from "react";

export interface LazyBrandLogoProps {
  logoUrl?: string;
  logoText: string;
  logoBg: string;
  brandName: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
}

const SIZE_CLASSES = {
  xs: "w-8 h-8 rounded-lg text-[10px]",
  sm: "w-10 h-10 rounded-xl text-xs",
  md: "w-12 h-12 rounded-xl text-xs sm:text-sm",
  lg: "w-14 h-14 rounded-2xl text-sm sm:text-base",
  xl: "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-xl sm:text-2xl"
};

/**
 * Lazy-loaded Brand Logo component
 * - If an image URL is supplied, it lazily loads using IntersectionObserver + decoding="async"
 * - If image is loading or unavailable, it shows the brand's designated gradient typography badge
 * - Fully optimized for zero Cumulative Layout Shift (CLS) in Google Lighthouse & PageSpeed
 */
export const LazyBrandLogo: React.FC<LazyBrandLogoProps> = ({
  logoUrl,
  logoText,
  logoBg,
  brandName,
  size = "md",
  className = "",
  priority = false
}) => {
  const [isInView, setIsInView] = useState(priority);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (priority || !logoUrl) return;

    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: "150px 0px", threshold: 0.01 }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    } else {
      setIsInView(true);
    }
  }, [priority, logoUrl]);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const hasValidImage = Boolean(logoUrl && !imageError);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center font-black shrink-0 select-none overflow-hidden transition-all shadow-xs ${sizeClass} ${
        !hasValidImage || !imageLoaded ? `bg-gradient-to-br ${logoBg}` : "bg-white border border-slate-200/80"
      } ${className}`}
      title={brandName}
    >
      {/* Fallback Gradient Text (Visible while loading or if no logoUrl) */}
      {(!hasValidImage || !imageLoaded) && (
        <span className="tracking-wider uppercase truncate px-1 drop-shadow-xs">
          {logoText.slice(0, 6)}
        </span>
      )}

      {/* Lazy-Loaded Image with smooth fade-in */}
      {hasValidImage && isInView && (
        <img
          src={logoUrl}
          alt={`شعار ${brandName}`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`absolute inset-0 w-full h-full object-contain p-1.5 transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
};
