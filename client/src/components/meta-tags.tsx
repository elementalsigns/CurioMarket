import { useEffect } from "react";

interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  price?: string;
  currency?: string;
  siteName?: string;
}

export function MetaTags({ 
  title, 
  description, 
  image, 
  url = window.location.href,
  type = "website",
  price,
  currency = "USD",
  siteName = "Curio Market"
}: MetaTagsProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Set base meta tags
    setMetaTag("description", description);
    
    // Open Graph tags
    setMetaTag("og:title", title);
    setMetaTag("og:description", description);
    setMetaTag("og:url", url);
    setMetaTag("og:type", type);
    setMetaTag("og:site_name", siteName);
    
    if (image) {
      setMetaTag("og:image", image);
      setMetaTag("og:image:width", "1200");
      setMetaTag("og:image:height", "630");
      setMetaTag("og:image:alt", title);
    }

    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    if (image) {
      setMetaTag("twitter:image", image);
    }

    // Product-specific tags for listings
    if (type === "product" && price) {
      setMetaTag("product:price:amount", price);
      setMetaTag("product:price:currency", currency);
      setMetaTag("og:type", "product");
    }

    // Cleanup function to remove meta tags when component unmounts
    return () => {
      const metaTags = document.querySelectorAll('[data-meta-tags="true"]');
      metaTags.forEach(tag => tag.remove());
    };
  }, [title, description, image, url, type, price, currency, siteName]);

  return null; // This component doesn't render anything
}

function setMetaTag(property: string, content: string) {
  // Remove existing tag
  const existingTag = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
  if (existingTag) {
    existingTag.remove();
  }

  // Create new tag
  const meta = document.createElement("meta");
  
  // Use 'property' for Open Graph and 'name' for Twitter and standard meta tags
  if (property.startsWith("og:") || property.startsWith("product:")) {
    meta.setAttribute("property", property);
  } else {
    meta.setAttribute("name", property);
  }
  
  meta.setAttribute("content", content);
  meta.setAttribute("data-meta-tags", "true");
  
  document.head.appendChild(meta);
}