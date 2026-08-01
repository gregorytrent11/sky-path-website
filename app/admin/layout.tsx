import type { Metadata } from "next";

// Belt-and-suspenders alongside robots.txt's /admin/ disallow: this covers
// crawlers that ignore robots.txt, and login/(protected) pages below are
// "use client" so they can't export their own `metadata`.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
