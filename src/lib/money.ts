/**
 * Money formatting — integer cents in, a locale-formatted currency
 * string out. Every monetary amount in this codebase (see
 * src/services/billing/billing.ts) is stored as an integer number of
 * cents, never a floating-point dollar amount, per standard
 * floating-point-money-arithmetic-avoidance practice. This is the one
 * shared place that turns cents back into something human-readable, so
 * no page independently reimplements (or subtly mis-implements) the
 * conversion.
 */
export function formatCents(amountCents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amountCents / 100);
}
