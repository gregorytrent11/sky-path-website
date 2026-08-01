import type { MetadataRoute } from "next";
import { fetchDogsForBuild } from "@/lib/build-time-dogs";

export const dynamic = "force-static";

const STATIC_ROUTES = [
  "",
  "dogs",
  "adopt",
  "adopt/application",
  "foster",
  "foster/application",
  "volunteer",
  "about",
  "contact",
  "donate",
  "success-stories",
  "resources",
  "request-help",
  "privacy",
  "terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://skyspath.com";

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}/${route}${route ? "/" : ""}`,
    changeFrequency: route === "" || route === "dogs" ? "daily" : "monthly",
    priority: route === "" ? 1 : route === "dogs" ? 0.9 : 0.5,
  }));

  const dogs = await fetchDogsForBuild();
  const dogEntries: MetadataRoute.Sitemap = dogs.map((dog) => ({
    url: `${siteUrl}/dogs/${dog.slug}/`,
    lastModified: dog.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...dogEntries];
}
