const DATABASE_NAME = "mori-user-media";
const STORE_NAME = "profile-assets";
const DATABASE_VERSION = 1;

const openDatabase = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const runTransaction = async (mode, action) => {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      const request = action(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
};

const photoId = (userId) => `${userId}:profile-photo`;
const variantId = (userId, id) => `${userId}:character:${id}`;

export const saveProfilePhoto = async (userId, blob) => {
  const record = {
    id: photoId(userId),
    userId,
    kind: "source-photo",
    blob,
    updatedAt: new Date().toISOString(),
  };
  await runTransaction("readwrite", (store) => store.put(record));
  return record;
};

export const loadProfilePhoto = (userId) =>
  runTransaction("readonly", (store) => store.get(photoId(userId)));

export const saveCharacterVariants = async (userId, variants) => {
  await Promise.all(
    variants.map((variant) =>
      runTransaction("readwrite", (store) =>
        store.put({
          id: variantId(userId, variant.id),
          userId,
          kind: "character-variant",
          variantId: variant.id,
          blob: variant.blob,
          updatedAt: new Date().toISOString(),
        }),
      ),
    ),
  );
};

export const loadCharacterVariants = async (userId, options = []) => {
  const records = await Promise.all(
    options.map((option) =>
      runTransaction("readonly", (store) =>
        store.get(variantId(userId, option.id)),
      ),
    ),
  );
  return options
    .map((option, index) =>
      records[index]?.blob ? { ...option, blob: records[index].blob } : null,
    )
    .filter(Boolean);
};

export const clearCharacterVariants = async (userId, options = []) => {
  await Promise.all(
    options.map((option) =>
      runTransaction("readwrite", (store) =>
        store.delete(variantId(userId, option.id)),
      ),
    ),
  );
};
