const SESSION_KEY = "mori-session-v1";
const USER_KEY_PREFIX = "mori-user";

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const createId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const getCurrentUser = () => {
  const saved = safeParse(localStorage.getItem(SESSION_KEY), null);
  if (saved?.id) return saved;
  const session = {
    id: createId(),
    authProvider: "local",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const userStorageKey = (userId, domain) =>
  `${USER_KEY_PREFIX}:${userId}:${domain}`;

export const readUserText = (userId, domain, legacyKey = null) => {
  const key = userStorageKey(userId, domain);
  const scoped = localStorage.getItem(key);
  if (scoped !== null) return scoped;
  const legacy = legacyKey ? localStorage.getItem(legacyKey) : null;
  if (legacy !== null) localStorage.setItem(key, legacy);
  return legacy;
};

export const writeUserText = (userId, domain, value) => {
  localStorage.setItem(userStorageKey(userId, domain), value);
};

export const readUserJson = (
  userId,
  domain,
  fallback,
  legacyKey = null,
) => safeParse(readUserText(userId, domain, legacyKey), fallback);

export const writeUserJson = (userId, domain, value) => {
  writeUserText(userId, domain, JSON.stringify(value));
};

export const emptyChildProfile = (userId) => ({
  schemaVersion: 1,
  userId,
  name: "",
  selectedVariantId: null,
  variantOptions: [],
  completed: false,
  updatedAt: null,
});

export const loadChildProfile = (userId) => ({
  ...emptyChildProfile(userId),
  ...readUserJson(userId, "child-profile", {}, null),
  userId,
});

export const saveChildProfile = (profile) => {
  const next = {
    ...profile,
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
  };
  writeUserJson(profile.userId, "child-profile", next);
  return next;
};

// Supabase migration boundary:
// - getCurrentUser() becomes the authenticated auth.users row.
// - the read/write helpers become repositories filtered by that user's UUID.
// - callers already pass userId explicitly, so UI state does not need reshaping.
