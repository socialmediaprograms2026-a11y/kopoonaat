import React, { useState, useEffect, useRef } from "react";

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  aspectRatio?: string;
  placeholderColor?: string;
  rootMargin?: string;
  threshold?: number;
  priority?: boolean;
}

/**
 * High-performance Lazy-Loaded Image component
 * - Complies with Google Core Web Vitals & Google PageSpeed Recommendations:
 *   1. Native loading="lazy" with IntersectionObserver fallback.
 *   2. decoding="async" for non-blocking UI rendering.
 *   3. Smooth fade-in transition when loaded to eliminate Cumulative Layout Shift (CLS).
 *   4. Fallback placeholder / skeleton support.
 *   5. Automatic aspect-ratio protection against layout shifts.
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className = "",
  aspectRatio,
  placeholderColor = "bg-slate-100",
  rootMargin = "200px 0px",
  threshold = 0.01,
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (priority) return;

    // Use IntersectionObserver for viewport lazy detection
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
        { rootMargin, threshold }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => {
        observer.disconnect();
      };
    } else {
      // Fallback for environments without IntersectionObserver
      setIsInView(true);
    }
  }, [priority, rootMargin, threshold]);

  const currentSrc = hasError ? (fallbackSrc || src) : src;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${placeholderColor} ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Skeleton / Blur Shimmer while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse pointer-events-none" />
      )}

      {isInView && (
        <img
          src={currentSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (!hasError && fallbackSrc) {
              setHasError(true);
            } else {
              setIsLoaded(true);
            }
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          {...props}
        />
      )}
    </div>
  );
};
