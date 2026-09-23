/**
 * Neorgon shared browser auth: Clerk session + ConvexHttpClient JWT (template "convex").
 * Lives in the neorgon-auth-client repo; sites load this module from their deployed URL
 * or from the local CORS dev server (make serve).
 *
 * @typedef {object} NeorgonAuthOptions
 * @property {import("https://esm.sh/convex@1.21.0/browser").ConvexHttpClient} convex
 * @property {string} publishableKey Clerk publishable key (pk_test_… / pk_live_…)
 * @property {HTMLElement | string} signInHost Mount target for SignIn (selector or element)
 * @property {HTMLElement | string} [userButtonHost] Mount target for UserButton when signed in
 * @property {(info: { clerk: import("@clerk/clerk-js").LoadedClerk, hasSession: boolean }) => void} [onSession] Called after load and when session changes
 * @property {Record<string, unknown>} [signInProps] Extra props passed to Clerk `mountSignIn` (e.g. `appearance`, `localization`).
 */

/** @param {HTMLElement | string | undefined} host */
function el(host) {
  if (!host) return null;
  if (typeof host === "string") return document.querySelector(host);
  return host;
}

/** @param {import("@clerk/clerk-js").LoadedClerk} clerk */
/** @param {import("https://esm.sh/convex@1.21.0/browser").ConvexHttpClient} convex */
function bindConvexAuth(clerk, convex) {
  convex.setAuth(async () => {
    try {
      const session = clerk.session;
      if (!session) return null;
      const token = await session.getToken({ template: "convex" });
      return token ?? null;
    } catch {
      return null;
    }
  });
}

/**
 * Load Clerk, wire Convex JWT, mount Sign-In or UserButton.
 * @param {NeorgonAuthOptions} options
 * @returns {Promise<import("@clerk/clerk-js").LoadedClerk>}
 */
export async function initNeorgonClerkConvex(options) {
  const { convex, publishableKey, signInHost, userButtonHost, onSession, signInProps = {} } = options;
  if (!publishableKey) {
    throw new Error("Neorgon auth: set <meta name=\"clerk-publishable-key\" content=\"pk_…\"> or pass publishableKey.");
  }

  const { Clerk } = await import("https://esm.sh/@clerk/clerk-js@5.59.0");
  const clerk = new Clerk(publishableKey);

  const signInEl = el(signInHost);
  const userEl = el(userButtonHost);

  let mounted = /** @type {"signin" | "user" | null} */ (null);

  function unmountClerkUi() {
    if (mounted === "signin" && signInEl) {
      try {
        clerk.unmountSignIn(signInEl);
      } catch {
        /* ignore */
      }
    }
    if (mounted === "user" && userEl) {
      try {
        clerk.unmountUserButton(userEl);
      } catch {
        /* ignore */
      }
    }
    mounted = null;
    if (signInEl) signInEl.replaceChildren();
    if (userEl) userEl.replaceChildren();
  }

  function mountClerkUi() {
    unmountClerkUi();
    bindConvexAuth(clerk, convex);
    if (clerk.session && userEl) {
      clerk.mountUserButton(userEl);
      mounted = "user";
    } else if (signInEl) {
      clerk.mountSignIn(signInEl, {
        routing: "hash",
        fallbackRedirectUrl: window.location.href,
        signUpUrl: window.location.href,
        ...signInProps,
      });
      mounted = "signin";
    }
    onSession?.({ clerk, hasSession: !!clerk.session });
  }

  await clerk.load();
  bindConvexAuth(clerk, convex);
  mountClerkUi();

  if (typeof clerk.addListener === "function") {
    let prev = !!clerk.session;
    clerk.addListener(() => {
      const next = !!clerk.session;
      bindConvexAuth(clerk, convex);
      if (next !== prev) {
        prev = next;
        mountClerkUi();
      } else {
        onSession?.({ clerk, hasSession: next });
      }
    });
  }

  return clerk;
}

/**
 * Sign out and clear Convex credentials (call after clerk.signOut if you handle UI yourself).
 * @param {import("@clerk/clerk-js").LoadedClerk} clerk
 * @param {import("https://esm.sh/convex@1.21.0/browser").ConvexHttpClient} convex
 */
export async function neorgonSignOut(clerk, convex) {
  await clerk.signOut({ redirectUrl: window.location.href });
  convex.clearAuth();
}

/** @param {import("@clerk/clerk-js").LoadedClerk} clerk */
export function neorgonDisplayLabel(clerk) {
  const u = clerk.user;
  if (!u) return "";
  if (u.username) return u.username;
  const email = u.primaryEmailAddress?.emailAddress;
  if (email) return email.split("@")[0] || email;
  if (u.firstName) return u.firstName;
  return "Account";
}
