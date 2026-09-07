import { useEffect } from "react";

export const SITE_URL = "https://tracepg.com";

export default function SEO({
  title = "TracePG | NEET-PG preparation workspace",
  description = "TracePG helps medical students prepare for NEET-PG with focused question practice, PYQs, revision, and progress tracking.",
  path = "/",
  noindex = false,
  structuredData,
}) {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const schemaText = structuredData ? JSON.stringify(structuredData) : "";

  useEffect(() => {
    document.title = title;
    document.documentElement.lang = "en";
    setMeta("description", description);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:url", canonicalUrl, "property");
    setMeta("og:site_name", "TracePG", "property");
    setMeta("twitter:card", "summary", "name");
    setMeta("twitter:title", title, "name");
    setMeta("twitter:description", description, "name");

    let canonical = document.head.querySelector("link[data-tracepg-seo='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.dataset.tracepgSeo = "canonical";
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    let schema = document.head.querySelector("script[data-tracepg-seo='schema']");
    if (schemaText) {
      if (!schema) {
        schema = document.createElement("script");
        schema.dataset.tracepgSeo = "schema";
        schema.type = "application/ld+json";
        document.head.appendChild(schema);
      }
      schema.textContent = schemaText;
    } else if (schema) {
      schema.remove();
    }
  }, [canonicalUrl, description, noindex, schemaText, title]);

  return null;
}

function setMeta(name, content, attribute = "name") {
  let element = document.head.querySelector(`meta[data-tracepg-seo='${name}']`)
    || document.head.querySelector(`meta[${attribute}='${name}']`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.dataset.tracepgSeo = name;
  element.content = content;
}
