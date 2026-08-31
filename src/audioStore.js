const DATABASE_NAME = "mori-reading-audio";
const STORE_NAME = "recordings";
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

const scopedId = (userId, id) => `${userId}::${id}`;

export const loadRecordings = async (userId) => {
  const records = await runTransaction("readonly", (store) => store.getAll());
  const prefix = `${userId}::`;
  const scoped = records
    .filter((record) => record.id.startsWith(prefix))
    .map((record) => [record.id.slice(prefix.length), record]);
  if (scoped.length) return Object.fromEntries(scoped);

  // Preserve recordings made before user-scoped storage was introduced.
  return Object.fromEntries(
    records
      .filter((record) => !record.id.includes("::"))
      .map((record) => [record.id, record]),
  );
};

export const saveRecording = async (userId, id, blob) => {
  const record = {
    id: scopedId(userId, id),
    userId,
    recordingId: id,
    blob,
    updatedAt: new Date().toISOString(),
  };
  await runTransaction("readwrite", (store) => store.put(record));
  return record;
};

export const removeRecording = async (userId, id) => {
  await runTransaction("readwrite", (store) =>
    store.delete(scopedId(userId, id)),
  );
};
