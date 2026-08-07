import { vi, beforeEach } from "vitest";

/**
 * Global test setup.
 *
 * Mocks `next/headers`'s `cookies()` with an in-memory store so
 * src/services/identity/session.ts (which reads/writes the session
 * cookie via that API) is testable outside an actual Next.js request —
 * the same approach Testing Strategy Implementation recommends for
 * exercising real service-layer logic in Integration tests rather than
 * re-implementing it behind a mock.
 */

class FakeCookieStore {
  private store = new Map<string, string>();

  get(name: string) {
    const value = this.store.get(name);
    return value === undefined ? undefined : { name, value };
  }

  set(name: string, value: string) {
    this.store.set(name, value);
  }

  delete(name: string) {
    this.store.delete(name);
  }

  has(name: string) {
    return this.store.has(name);
  }

  clear() {
    this.store.clear();
  }
}

export const fakeCookieStore = new FakeCookieStore();

vi.mock("next/headers", () => ({
  cookies: async () => fakeCookieStore,
}));

// next/navigation's redirect() throws a special NEXT_REDIRECT signal in
// real Next.js; outside that runtime it's just a function. Tests assert
// on it by catching the thrown marker below.
export class TestRedirectSignal extends Error {
  constructor(public destination: string) {
    super(`NEXT_REDIRECT:${destination}`);
  }
}

vi.mock("next/navigation", () => ({
  redirect: (destination: string) => {
    throw new TestRedirectSignal(destination);
  },
  notFound: () => {
    throw new TestRedirectSignal("__NOT_FOUND__");
  },
}));

// next/cache's revalidatePath only works inside an active Next.js
// request/render context; outside it (i.e. under Vitest), it's a no-op
// here so service-layer tests can call functions that happen to trigger
// it without needing a real Next.js server running.
vi.mock("next/cache", () => ({
  revalidatePath: () => {},
  revalidateTag: () => {},
}));

beforeEach(() => {
  fakeCookieStore.clear();
});
