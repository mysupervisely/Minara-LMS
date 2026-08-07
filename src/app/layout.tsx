import type { Metadata } from "next";
import "./globals.css";

/**
 * Root layout. Deliberately uses the system font stack (see
 * globals.css) rather than a web-font loader — one fewer network
 * dependency for this vertical slice, consistent with Technology
 * Selection Principles' "avoid unnecessary complexity."
 */
export const metadata: Metadata = {
  title: {
    default: "Minara Institute of Health Sciences",
    template: "%s — Minara Institute of Health Sciences",
  },
  description:
    "Minara Institute of Health Sciences — programs, admissions, and the Minara-LMS student and faculty experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
