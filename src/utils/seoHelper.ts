/**
 * SEO & Search Engine Optimization Helper
 * Manages dynamic document title, meta description, canonical URL, OpenGraph,
 * and history state synchronization for Google and search engine indexing.
 */

export interface PageSeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: "website" | "article" | "product";
  ogImage?: string;
  keywords?: string[];
  noindex?: boolean;
}

export function updateDocumentSeo(config: PageSeoConfig): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  // 1. Title
  document.title = config.title;

  // 2. Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", config.description);

  // 3. Canonical Link
  const origin = window.location.origin;
  const cleanPath = config.canonicalPath.startsWith("/") ? config.canonicalPath : `/${config.canonicalPath}`;
  const canonicalUrl = `${origin}${cleanPath === "/" ? "" : cleanPath}`;

  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.setAttribute("rel", "canonical");
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute("href", canonicalUrl);

  // 4. OpenGraph Tags
  const setMetaProperty = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", property);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  setMetaProperty("og:title", config.title);
  setMetaProperty("og:description", config.description);
  setMetaProperty("og:url", canonicalUrl);
  setMetaProperty("og:type", config.ogType || "website");
  if (config.ogImage) {
    setMetaProperty("og:image", config.ogImage);
  }

  // 5. Twitter Card Tags
  const setMetaName = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  setMetaName("twitter:title", config.title);
  setMetaName("twitter:description", config.description);
  if (config.ogImage) {
    setMetaName("twitter:image", config.ogImage);
  }

  // 6. Keywords
  if (config.keywords && config.keywords.length > 0) {
    setMetaName("keywords", config.keywords.join(", "));
  }

  // 7. Robots directive
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement("meta");
    robotsMeta.setAttribute("name", "robots");
    document.head.appendChild(robotsMeta);
  }
  if (config.noindex) {
    robotsMeta.setAttribute("content", "noindex, nofollow");
  } else {
    robotsMeta.setAttribute("content", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
  }
}
