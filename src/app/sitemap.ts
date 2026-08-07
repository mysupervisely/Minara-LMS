import type { MetadataRoute } from "next";
import { listPrograms } from "@/services/academic/institution";

/** SEO metadata foundation (Milestone 10, Phase 2) — a generated, data-driven sitemap covering the Public Website's SSR pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const programs = await listPrograms();

  return [
    { url: "/" },
    { url: "/programs" },
    ...programs.map((program) => ({ url: `/programs/${program.slug}` })),
  ];
}
